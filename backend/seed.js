const mysql = require('mysql2/promise');
require('dotenv').config();

async function seed() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  console.log('🔌 Connected to database');

  // --- Add missing columns if they don't exist ---
  const addColumnIfMissing = async (table, column, definition) => {
    const [cols] = await conn.execute(`SHOW COLUMNS FROM ${table} LIKE '${column}'`);
    if (cols.length === 0) {
      await conn.execute(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
      console.log(`  ➕ Added column ${table}.${column}`);
    } else {
      console.log(`  ✅ Column ${table}.${column} already exists`);
    }
  };

  await addColumnIfMissing('subjects', 'slug', "VARCHAR(255) NOT NULL DEFAULT '' AFTER title");
  await addColumnIfMissing('subjects', 'is_published', "TINYINT(1) NOT NULL DEFAULT 1 AFTER is_free");
  await addColumnIfMissing('videos', 'description', "TEXT DEFAULT NULL AFTER title");

  // --- Clean existing data ---
  await conn.execute('SET FOREIGN_KEY_CHECKS = 0');
  await conn.execute('TRUNCATE TABLE videos');
  await conn.execute('TRUNCATE TABLE sections');
  await conn.execute('TRUNCATE TABLE subjects');
  await conn.execute('SET FOREIGN_KEY_CHECKS = 1');
  console.log('🗑️  Cleared existing data');

  // ============================================================
  //  COURSE CATALOG DATA
  // ============================================================
  const courses = [
    // ── Python ──────────────────────────────────────────────────
    {
      title: 'Python for Beginners',
      slug: 'python-for-beginners',
      description: 'Start your programming journey with Python. Learn variables, loops, functions, and core fundamentals in a hands-on, beginner-friendly course.',
      price: 0, is_free: true,
      sections: [
        { title: 'Getting Started with Python', videos: [
          { title: 'Installing Python & Setting Up VS Code', desc: 'Step-by-step setup of Python and your development environment.', url: 'https://www.youtube.com/watch?v=YYXdXT2l-Gg' },
          { title: 'Variables, Data Types & Operators', desc: 'Learn about strings, integers, floats, and basic operators.', url: 'https://www.youtube.com/watch?v=cQT33yu9pY8' },
          { title: 'Taking User Input & Type Casting', desc: 'Handle user input and convert between data types.', url: 'https://www.youtube.com/watch?v=kqtD5dpn9C8' },
        ]},
        { title: 'Control Flow & Functions', videos: [
          { title: 'If-Else Statements & Conditionals', desc: 'Make decisions in your code with conditional statements.', url: 'https://www.youtube.com/watch?v=DZwmZ8Usvnk' },
          { title: 'For and While Loops', desc: 'Iterate through data using Python loops.', url: 'https://www.youtube.com/watch?v=6iF8Xb7Z3wQ' },
          { title: 'Defining and Using Functions', desc: 'Create reusable code blocks with functions.', url: 'https://www.youtube.com/watch?v=9Os0o3wzS_I' },
        ]},
      ],
    },
    {
      title: 'Advanced Python Programming',
      slug: 'advanced-python-programming',
      description: 'Master advanced Python concepts including decorators, generators, context managers, and object-oriented patterns for production-grade code.',
      price: 499, is_free: false,
      sections: [
        { title: 'OOP Deep Dive', videos: [
          { title: 'Classes, Objects & Constructors', desc: 'Build robust classes with constructors and instance methods.', url: 'https://www.youtube.com/watch?v=ZDa-Z5JzLYM' },
          { title: 'Inheritance & Polymorphism', desc: 'Extend classes and override behaviour with polymorphism.', url: 'https://www.youtube.com/watch?v=Cn7AkDb4pIU' },
          { title: 'Magic Methods & Operator Overloading', desc: 'Customise built-in behaviour with dunder methods.', url: 'https://www.youtube.com/watch?v=3ohzBxoFHAY' },
        ]},
        { title: 'Advanced Patterns', videos: [
          { title: 'Decorators & Closures', desc: 'Write elegant wrappers and higher-order functions.', url: 'https://www.youtube.com/watch?v=FsAPt_9Bf3U' },
          { title: 'Generators & Iterators', desc: 'Handle large datasets efficiently with lazy evaluation.', url: 'https://www.youtube.com/watch?v=bD05uGo_sVI' },
          { title: 'Context Managers & File I/O', desc: 'Manage resources safely with the with statement.', url: 'https://www.youtube.com/watch?v=Lv1treHIckI' },
        ]},
      ],
    },
    {
      title: 'Python for Data Science',
      slug: 'python-for-data-science',
      description: 'Use Python for data analysis and visualization. Master NumPy, Pandas, and Matplotlib to extract insights from real-world datasets.',
      price: 799, is_free: false,
      sections: [
        { title: 'NumPy & Pandas Essentials', videos: [
          { title: 'Introduction to NumPy Arrays', desc: 'Create and manipulate arrays for scientific computing.', url: 'https://www.youtube.com/watch?v=QUT1VHiLmmI' },
          { title: 'Pandas DataFrames & Series', desc: 'Load, filter, and transform tabular data with Pandas.', url: 'https://www.youtube.com/watch?v=vmEHCJofslg' },
          { title: 'Data Cleaning Techniques', desc: 'Handle missing values, duplicates, and messy data.', url: 'https://www.youtube.com/watch?v=ZOX18HfLHGQ' },
        ]},
        { title: 'Data Visualization', videos: [
          { title: 'Matplotlib Basics', desc: 'Create line charts, bar plots, and histograms.', url: 'https://www.youtube.com/watch?v=3Xc3CA655Y4' },
          { title: 'Seaborn for Statistical Plots', desc: 'Build heatmaps, pair plots, and distribution charts.', url: 'https://www.youtube.com/watch?v=6GUZXDef2U0' },
        ]},
      ],
    },

    // ── Java ────────────────────────────────────────────────────
    {
      title: 'Core Java Fundamentals',
      slug: 'core-java-fundamentals',
      description: 'Learn Java from scratch — syntax, data types, control flow, arrays, and methods. The essential foundation every Java developer needs.',
      price: 0, is_free: true,
      sections: [
        { title: 'Java Basics', videos: [
          { title: 'Installing JDK & IntelliJ IDEA', desc: 'Set up your Java development environment.', url: 'https://www.youtube.com/watch?v=eIrMbAQSU34' },
          { title: 'Variables, Data Types & Operators', desc: 'Understand primitives, reference types, and expressions.', url: 'https://www.youtube.com/watch?v=so1iUWaLmKA' },
          { title: 'Conditional Statements & Loops', desc: 'Control program flow with if-else, switch, for, and while.', url: 'https://www.youtube.com/watch?v=ldYLYRNaucM' },
        ]},
        { title: 'Arrays & Methods', videos: [
          { title: 'Working with Arrays', desc: 'Declare, initialize, and iterate through arrays.', url: 'https://www.youtube.com/watch?v=ei_4Nt7XWOw' },
          { title: 'Methods & Scope', desc: 'Define methods, pass parameters, and return values.', url: 'https://www.youtube.com/watch?v=cCgOESMQe44' },
          { title: 'String Manipulation', desc: 'Use the String class and common string operations.', url: 'https://www.youtube.com/watch?v=iCojkbF2S8o' },
        ]},
      ],
    },
    {
      title: 'Java Object-Oriented Programming',
      slug: 'java-oop',
      description: 'Deep dive into Java OOP — classes, objects, inheritance, polymorphism, abstraction, and interfaces with real-world examples.',
      price: 599, is_free: false,
      sections: [
        { title: 'Classes & Inheritance', videos: [
          { title: 'Creating Classes & Objects', desc: 'Instantiate objects and define class blueprints.', url: 'https://www.youtube.com/watch?v=IUqKuGNasdM' },
          { title: 'Constructors & this Keyword', desc: 'Initialize objects with constructors and self-references.', url: 'https://www.youtube.com/watch?v=MROj5TRhVNs' },
          { title: 'Inheritance & super Keyword', desc: 'Extend parent classes and call super constructors.', url: 'https://www.youtube.com/watch?v=Zs342ePFvRI' },
        ]},
        { title: 'Polymorphism & Abstraction', videos: [
          { title: 'Method Overloading & Overriding', desc: 'Compile-time and runtime polymorphism in Java.', url: 'https://www.youtube.com/watch?v=TaDCsotKOOk' },
          { title: 'Abstract Classes & Interfaces', desc: 'Design contracts and abstract behaviours.', url: 'https://www.youtube.com/watch?v=HvPlEJ3LHgE' },
        ]},
      ],
    },
    {
      title: 'Spring Boot for Beginners',
      slug: 'spring-boot-basics',
      description: 'Build production-ready REST APIs with Spring Boot. Learn dependency injection, Spring MVC, JPA, and microservice fundamentals.',
      price: 999, is_free: false,
      sections: [
        { title: 'Spring Boot Setup & REST APIs', videos: [
          { title: 'Creating Your First Spring Boot App', desc: 'Bootstrap a project with Spring Initializr.', url: 'https://www.youtube.com/watch?v=9SGDpanrc8U' },
          { title: 'Building REST Controllers', desc: 'Handle HTTP requests with @RestController.', url: 'https://www.youtube.com/watch?v=MWLe1tqPmUo' },
          { title: 'Request Body, Path & Query Params', desc: 'Parse incoming data from API requests.', url: 'https://www.youtube.com/watch?v=lMglmMHOc30' },
        ]},
        { title: 'Data Layer with JPA', videos: [
          { title: 'Spring Data JPA & Repositories', desc: 'Interact with databases using JPA repositories.', url: 'https://www.youtube.com/watch?v=8SGI_XS5OPw' },
          { title: 'Entity Relationships & Queries', desc: 'Map one-to-many and many-to-many relationships.', url: 'https://www.youtube.com/watch?v=c5OaAz2IjKo' },
        ]},
      ],
    },

    // ── Cyber Security ──────────────────────────────────────────
    {
      title: 'Ethical Hacking Basics',
      slug: 'ethical-hacking-basics',
      description: 'Learn the foundations of ethical hacking — reconnaissance, scanning, enumeration, and penetration testing methodologies.',
      price: 0, is_free: true,
      sections: [
        { title: 'Introduction to Ethical Hacking', videos: [
          { title: 'What is Ethical Hacking?', desc: 'Understand the role of white-hat hackers and legal frameworks.', url: 'https://www.youtube.com/watch?v=3Kq1MIfTWCE' },
          { title: 'Setting Up Kali Linux', desc: 'Install and configure Kali Linux for pentesting.', url: 'https://www.youtube.com/watch?v=l97dVIKlmVg' },
          { title: 'Footprinting & Reconnaissance', desc: 'Gather information about targets using OSINT.', url: 'https://www.youtube.com/watch?v=q2t6VWJuVaQ' },
        ]},
        { title: 'Scanning & Exploitation', videos: [
          { title: 'Network Scanning with Nmap', desc: 'Discover hosts, ports, and services on a network.', url: 'https://www.youtube.com/watch?v=4t4kBkMsDbQ' },
          { title: 'Vulnerability Scanning Basics', desc: 'Use scanners to identify known weaknesses.', url: 'https://www.youtube.com/watch?v=5MTZdN9TEO4' },
        ]},
      ],
    },
    {
      title: 'Network Security Fundamentals',
      slug: 'network-security-fundamentals',
      description: 'Understand firewalls, IDS/IPS, VPNs, and secure network architecture. Build a strong foundation in defending network infrastructure.',
      price: 699, is_free: false,
      sections: [
        { title: 'Network Defence Concepts', videos: [
          { title: 'OSI Model & Network Protocols', desc: 'Understand the layers and protocols that power networks.', url: 'https://www.youtube.com/watch?v=vv4y_uOneC0' },
          { title: 'Firewalls & Packet Filtering', desc: 'Configure firewalls and understand packet inspection.', url: 'https://www.youtube.com/watch?v=kDEX1HXybrU' },
          { title: 'VPNs & Encryption Basics', desc: 'Secure communications with VPNs and encryption.', url: 'https://www.youtube.com/watch?v=WVDQEoe6ZWY' },
        ]},
        { title: 'Intrusion Detection', videos: [
          { title: 'IDS vs IPS Explained', desc: 'Detect and prevent unauthorized network access.', url: 'https://www.youtube.com/watch?v=rvKQtRklwQ4' },
          { title: 'Network Monitoring with Wireshark', desc: 'Capture and analyse network traffic in real-time.', url: 'https://www.youtube.com/watch?v=lb1Dw0elj0Q' },
        ]},
      ],
    },
    {
      title: 'Web Application Security',
      slug: 'web-application-security',
      description: 'Identify and prevent common web vulnerabilities — SQL injection, XSS, CSRF, and OWASP Top 10 threats with practical examples.',
      price: 899, is_free: false,
      sections: [
        { title: 'OWASP Top 10 Vulnerabilities', videos: [
          { title: 'SQL Injection Attacks & Prevention', desc: 'Exploit and defend against SQL injection.', url: 'https://www.youtube.com/watch?v=2OPVViV-GQk' },
          { title: 'Cross-Site Scripting (XSS)', desc: 'Understand reflected, stored, and DOM-based XSS.', url: 'https://www.youtube.com/watch?v=EoaDgUgS6QA' },
          { title: 'Cross-Site Request Forgery (CSRF)', desc: 'Prevent CSRF attacks with tokens and headers.', url: 'https://www.youtube.com/watch?v=eWEgUcHPle0' },
        ]},
        { title: 'Secure Coding Practices', videos: [
          { title: 'Input Validation & Sanitization', desc: 'Sanitize user input to prevent injection attacks.', url: 'https://www.youtube.com/watch?v=sFyLhwAauEI' },
          { title: 'Authentication & Session Security', desc: 'Implement secure login, tokens, and session management.', url: 'https://www.youtube.com/watch?v=2PPSXonhIck' },
        ]},
      ],
    },

    // ── Artificial Intelligence ──────────────────────────────────
    {
      title: 'Introduction to Artificial Intelligence',
      slug: 'intro-to-ai',
      description: 'Explore AI concepts including search algorithms, knowledge representation, reasoning, and intelligent agents from the ground up.',
      price: 0, is_free: true,
      sections: [
        { title: 'AI Foundations', videos: [
          { title: 'What is Artificial Intelligence?', desc: 'Overview of AI, its history, and modern applications.', url: 'https://www.youtube.com/watch?v=JMUxmLyrhSk' },
          { title: 'Types of AI: Narrow vs General', desc: 'Compare weak AI, strong AI, and super intelligence.', url: 'https://www.youtube.com/watch?v=Pls_q2aQzHg' },
          { title: 'Search Algorithms in AI', desc: 'Explore BFS, DFS, A*, and heuristic search methods.', url: 'https://www.youtube.com/watch?v=amlkE0g_MnA' },
        ]},
        { title: 'Knowledge & Reasoning', videos: [
          { title: 'Knowledge Representation', desc: 'Represent facts and rules for intelligent systems.', url: 'https://www.youtube.com/watch?v=LbBMhOMoh0k' },
          { title: 'Expert Systems & Decision Trees', desc: 'Build rule-based systems that mimic human experts.', url: 'https://www.youtube.com/watch?v=ZVR2Way4nwQ' },
        ]},
      ],
    },

    // ── Machine Learning ─────────────────────────────────────────
    {
      title: 'Machine Learning Fundamentals',
      slug: 'machine-learning-fundamentals',
      description: 'Understand supervised, unsupervised, and reinforcement learning. Implement regression, classification, and clustering from scratch.',
      price: 0, is_free: true,
      sections: [
        { title: 'Supervised Learning', videos: [
          { title: 'What is Machine Learning?', desc: 'Introduction to ML concepts and workflow.', url: 'https://www.youtube.com/watch?v=ukzFI9rgwfU' },
          { title: 'Linear Regression from Scratch', desc: 'Build a regression model step by step.', url: 'https://www.youtube.com/watch?v=VmbA0lGBivs' },
          { title: 'Logistic Regression & Classification', desc: 'Classify data with logistic regression.', url: 'https://www.youtube.com/watch?v=yIYKR4sgzI8' },
        ]},
        { title: 'Unsupervised & Model Evaluation', videos: [
          { title: 'K-Means Clustering', desc: 'Group data into clusters using K-Means algorithm.', url: 'https://www.youtube.com/watch?v=4b5d3muPQmA' },
          { title: 'Model Evaluation Metrics', desc: 'Accuracy, precision, recall, F1-score, and confusion matrix.', url: 'https://www.youtube.com/watch?v=85dtiMz9tSo' },
          { title: 'Overfitting & Cross-Validation', desc: 'Detect and prevent overfitting with validation strategies.', url: 'https://www.youtube.com/watch?v=fSytzGwwBVw' },
        ]},
      ],
    },
    {
      title: 'Applied Machine Learning with Scikit-Learn',
      slug: 'applied-ml-scikit-learn',
      description: 'Hands-on machine learning with Python and Scikit-Learn. Build real-world models for classification, regression, and feature engineering.',
      price: 899, is_free: false,
      sections: [
        { title: 'Building ML Pipelines', videos: [
          { title: 'Data Preprocessing with Scikit-Learn', desc: 'Scale, encode, and split data for model training.', url: 'https://www.youtube.com/watch?v=0xVqLJe9_CY' },
          { title: 'Training Decision Trees & Random Forests', desc: 'Build tree-based models for classification tasks.', url: 'https://www.youtube.com/watch?v=7VeUPuFGJHk' },
          { title: 'Support Vector Machines', desc: 'Classify data with optimal hyperplanes.', url: 'https://www.youtube.com/watch?v=efR1C6CvhmE' },
        ]},
        { title: 'Model Tuning & Deployment', videos: [
          { title: 'Hyperparameter Tuning with GridSearch', desc: 'Optimize model performance with parameter search.', url: 'https://www.youtube.com/watch?v=HdlDYng8g9s' },
          { title: 'Saving & Loading Models with Pickle', desc: 'Serialize trained models for deployment.', url: 'https://www.youtube.com/watch?v=KfnhNlD8WZI' },
        ]},
      ],
    },

    // ── Deep Learning ────────────────────────────────────────────
    {
      title: 'Deep Learning Fundamentals',
      slug: 'deep-learning-fundamentals',
      description: 'Understand neural networks, backpropagation, activation functions, and build your first deep learning models with TensorFlow & Keras.',
      price: 0, is_free: true,
      sections: [
        { title: 'Neural Network Basics', videos: [
          { title: 'What are Neural Networks?', desc: 'Explore perceptrons, layers, and network architectures.', url: 'https://www.youtube.com/watch?v=aircAruvnKk' },
          { title: 'Activation Functions Explained', desc: 'ReLU, Sigmoid, Tanh, and Softmax functions.', url: 'https://www.youtube.com/watch?v=m0pIlLfpXWE' },
          { title: 'Backpropagation & Gradient Descent', desc: 'How neural networks learn through optimization.', url: 'https://www.youtube.com/watch?v=Ilg3gGewQ5U' },
        ]},
        { title: 'Building Models with Keras', videos: [
          { title: 'Your First Keras Neural Network', desc: 'Code a feedforward network for digit classification.', url: 'https://www.youtube.com/watch?v=wQ8BIBpya2k' },
          { title: 'Convolutional Neural Networks (CNNs)', desc: 'Build image classifiers with convolutional layers.', url: 'https://www.youtube.com/watch?v=YRhxdVk_sIs' },
        ]},
      ],
    },
    {
      title: 'Advanced Deep Learning with PyTorch',
      slug: 'advanced-deep-learning-pytorch',
      description: 'Master deep learning with PyTorch — build GANs, autoencoders, and transformer models for advanced AI applications.',
      price: 1299, is_free: false,
      sections: [
        { title: 'PyTorch Essentials', videos: [
          { title: 'Tensors & Autograd in PyTorch', desc: 'Understand tensors, gradients, and computational graphs.', url: 'https://www.youtube.com/watch?v=EMXfZB8FVUA' },
          { title: 'Building Neural Networks in PyTorch', desc: 'Define models with nn.Module and train them.', url: 'https://www.youtube.com/watch?v=oPhxf2fXHkQ' },
          { title: 'Training Loops & Optimizers', desc: 'Implement custom training loops with Adam and SGD.', url: 'https://www.youtube.com/watch?v=c36lUUr864M' },
        ]},
        { title: 'Advanced Architectures', videos: [
          { title: 'Generative Adversarial Networks (GANs)', desc: 'Train generators and discriminators for image synthesis.', url: 'https://www.youtube.com/watch?v=8L11aMN5KY8' },
          { title: 'Autoencoders & Variational Autoencoders', desc: 'Compress and generate data with encoder-decoder networks.', url: 'https://www.youtube.com/watch?v=fcvYpzHmhvA' },
        ]},
      ],
    },

    // ── NLP ──────────────────────────────────────────────────────
    {
      title: 'Natural Language Processing Essentials',
      slug: 'nlp-essentials',
      description: 'Learn text preprocessing, tokenization, sentiment analysis, and named entity recognition with Python and NLTK/spaCy.',
      price: 0, is_free: true,
      sections: [
        { title: 'Text Processing Foundations', videos: [
          { title: 'Introduction to NLP', desc: 'Understand what NLP is and its real-world applications.', url: 'https://www.youtube.com/watch?v=CMrHM8a3hqw' },
          { title: 'Tokenization & Stemming', desc: 'Break text into tokens and reduce words to roots.', url: 'https://www.youtube.com/watch?v=nxhCyeRR75Q' },
          { title: 'Bag of Words & TF-IDF', desc: 'Convert text into numerical feature vectors.', url: 'https://www.youtube.com/watch?v=D2V1okCEsiE' },
        ]},
        { title: 'NLP Applications', videos: [
          { title: 'Sentiment Analysis with Python', desc: 'Classify text as positive, negative, or neutral.', url: 'https://www.youtube.com/watch?v=QpzMWQvxXWk' },
          { title: 'Named Entity Recognition', desc: 'Extract names, locations, and organizations from text.', url: 'https://www.youtube.com/watch?v=Y_3vOPYfrSo' },
        ]},
      ],
    },
    {
      title: 'Transformers & Large Language Models',
      slug: 'transformers-llms',
      description: 'Explore the transformer architecture, attention mechanisms, BERT, GPT, and how large language models power modern AI systems.',
      price: 1499, is_free: false,
      sections: [
        { title: 'Transformer Architecture', videos: [
          { title: 'Attention Is All You Need – Explained', desc: 'Understand self-attention and the transformer model.', url: 'https://www.youtube.com/watch?v=XowwKOAWYoQ' },
          { title: 'BERT: Pre-training & Fine-tuning', desc: 'Use BERT for classification and question answering.', url: 'https://www.youtube.com/watch?v=xI0HHN5XKDo' },
          { title: 'GPT & Generative Models', desc: 'How GPT generates text and powers chatbots.', url: 'https://www.youtube.com/watch?v=SY5PvZrJhLE' },
        ]},
        { title: 'Hands-on with Hugging Face', videos: [
          { title: 'Using Hugging Face Transformers Library', desc: 'Load pre-trained models for NLP tasks in minutes.', url: 'https://www.youtube.com/watch?v=QEaBAZQCtwE' },
          { title: 'Fine-tuning Models with Custom Data', desc: 'Adapt pre-trained models to your specific domain.', url: 'https://www.youtube.com/watch?v=GSt00_-0ncQ' },
        ]},
      ],
    },

    // ── Full Stack Development ────────────────────────────────────
    {
      title: 'MERN Stack Development',
      slug: 'mern-stack-development',
      description: 'Build full-stack web apps with MongoDB, Express, React, and Node.js. Create REST APIs, connect front-end to back-end, and deploy.',
      price: 999, is_free: false,
      sections: [
        { title: 'Backend with Node & Express', videos: [
          { title: 'Setting Up Node.js & Express', desc: 'Create a server and handle routes.', url: 'https://www.youtube.com/watch?v=Oe421EPjeBE' },
          { title: 'MongoDB & Mongoose Basics', desc: 'Define schemas, models, and perform CRUD operations.', url: 'https://www.youtube.com/watch?v=DZBGEVgL2eE' },
          { title: 'Building RESTful APIs', desc: 'Design and implement RESTful endpoints.', url: 'https://www.youtube.com/watch?v=0oXYLzuucwE' },
        ]},
        { title: 'Frontend with React', videos: [
          { title: 'React Components & State', desc: 'Build UI with components and manage state.', url: 'https://www.youtube.com/watch?v=Tn6-PIqc4UM' },
          { title: 'Connecting React to Express API', desc: 'Fetch data from backend and display in React.', url: 'https://www.youtube.com/watch?v=7CqJlxBYj-M' },
          { title: 'Authentication with JWT', desc: 'Implement login, registration, and token management.', url: 'https://www.youtube.com/watch?v=mbsmsi7l3r4' },
        ]},
      ],
    },
    {
      title: 'Full Stack Java with Spring & Angular',
      slug: 'full-stack-java',
      description: 'Combine Spring Boot backend and Angular frontend to build enterprise-grade full-stack applications with database integration.',
      price: 1199, is_free: false,
      sections: [
        { title: 'Spring Boot Backend', videos: [
          { title: 'Spring Boot REST API Setup', desc: 'Create RESTful services with Spring Boot.', url: 'https://www.youtube.com/watch?v=35EQXmHKZYs' },
          { title: 'Spring Security & JWT Auth', desc: 'Secure APIs with Spring Security and JSON Web Tokens.', url: 'https://www.youtube.com/watch?v=KxqlJblhzfI' },
          { title: 'Database Integration with Hibernate', desc: 'Map Java objects to database tables with JPA.', url: 'https://www.youtube.com/watch?v=s9E7R5fKyio' },
        ]},
        { title: 'Angular Frontend', videos: [
          { title: 'Angular Components & Routing', desc: 'Build a single-page application with Angular.', url: 'https://www.youtube.com/watch?v=3dHNOWTI7H8' },
          { title: 'HTTP Client & API Integration', desc: 'Connect Angular frontend to Spring Boot backend.', url: 'https://www.youtube.com/watch?v=_z9SYCbcjhU' },
        ]},
      ],
    },
    {
      title: 'Full Stack Python with Django & React',
      slug: 'full-stack-python',
      description: 'Build modern web applications using Django REST Framework for the backend and React for the frontend, with full CRUD and auth.',
      price: 999, is_free: false,
      sections: [
        { title: 'Django REST Framework', videos: [
          { title: 'Django Project Setup & Models', desc: 'Configure Django and define database models.', url: 'https://www.youtube.com/watch?v=rHux0gMZ3Eg' },
          { title: 'Serializers & ViewSets', desc: 'Build APIs quickly with DRF serializers.', url: 'https://www.youtube.com/watch?v=cJveiktaOSQ' },
          { title: 'Authentication with Django', desc: 'Implement token-based auth with DRF.', url: 'https://www.youtube.com/watch?v=PUzgZrS_piQ' },
        ]},
        { title: 'React Integration', videos: [
          { title: 'React Frontend with Axios', desc: 'Build the UI and consume Django APIs.', url: 'https://www.youtube.com/watch?v=tYKRAXIio28' },
          { title: 'Deployment on Heroku', desc: 'Deploy the full-stack app to production.', url: 'https://www.youtube.com/watch?v=Ci4jnJL9yqc' },
        ]},
      ],
    },

    // ── Frontend Development ─────────────────────────────────────
    {
      title: 'Modern Frontend with React & Next.js',
      slug: 'modern-frontend-react-nextjs',
      description: 'Master React hooks, component patterns, and Next.js for server-side rendering, static generation, and production-grade frontend development.',
      price: 799, is_free: false,
      sections: [
        { title: 'React Deep Dive', videos: [
          { title: 'React Hooks: useState & useEffect', desc: 'Manage state and side effects in functional components.', url: 'https://www.youtube.com/watch?v=O6P86uwfdR0' },
          { title: 'Context API & Global State', desc: 'Share state across components without prop drilling.', url: 'https://www.youtube.com/watch?v=5LrDIWkK_Bc' },
          { title: 'Custom Hooks & Patterns', desc: 'Create reusable logic with custom hooks.', url: 'https://www.youtube.com/watch?v=Jl4q2cccwf0' },
        ]},
        { title: 'Next.js Essentials', videos: [
          { title: 'Pages, Routing & Layouts in Next.js', desc: 'File-based routing and layout composition.', url: 'https://www.youtube.com/watch?v=ZVnjOPwW4ZA' },
          { title: 'Server-Side Rendering & API Routes', desc: 'Build SSR pages and backend API endpoints.', url: 'https://www.youtube.com/watch?v=mTz0GXj8NN0' },
        ]},
      ],
    },
    {
      title: 'HTML, CSS & JavaScript from Scratch',
      slug: 'html-css-js-from-scratch',
      description: 'The ultimate beginner course for web development. Learn HTML structure, CSS styling, responsive design, and JavaScript fundamentals.',
      price: 0, is_free: true,
      sections: [
        { title: 'HTML & CSS Basics', videos: [
          { title: 'HTML Elements & Page Structure', desc: 'Build web pages with semantic HTML elements.', url: 'https://www.youtube.com/watch?v=qz0aGYrrlhU' },
          { title: 'CSS Selectors, Flexbox & Grid', desc: 'Style layouts with modern CSS techniques.', url: 'https://www.youtube.com/watch?v=1Rs2ND1ryYc' },
          { title: 'Responsive Design with Media Queries', desc: 'Make websites look great on any screen size.', url: 'https://www.youtube.com/watch?v=yU7jJ3NbPdA' },
        ]},
        { title: 'JavaScript Fundamentals', videos: [
          { title: 'Variables, Functions & Events', desc: 'Add interactivity with JavaScript basics.', url: 'https://www.youtube.com/watch?v=W6NZfCO5SIk' },
          { title: 'DOM Manipulation', desc: 'Select and modify HTML elements with JavaScript.', url: 'https://www.youtube.com/watch?v=5fb2aPlgoys' },
          { title: 'Fetch API & Async JavaScript', desc: 'Make HTTP requests and handle promises.', url: 'https://www.youtube.com/watch?v=cuEtnrL9-H0' },
        ]},
      ],
    },

    // ── Backend Development ──────────────────────────────────────
    {
      title: 'Node.js & Express Masterclass',
      slug: 'nodejs-express-masterclass',
      description: 'Build scalable backend services with Node.js and Express. Cover middleware, authentication, database integration, and error handling.',
      price: 799, is_free: false,
      sections: [
        { title: 'Node.js Core Concepts', videos: [
          { title: 'Node.js Event Loop & Modules', desc: 'Understand the event loop, modules, and npm.', url: 'https://www.youtube.com/watch?v=8aGhZQkoFbQ' },
          { title: 'Express Middleware & Routing', desc: 'Build APIs with middleware chains and routers.', url: 'https://www.youtube.com/watch?v=lY6icfhap2o' },
          { title: 'Error Handling & Validation', desc: 'Gracefully handle errors and validate input.', url: 'https://www.youtube.com/watch?v=DyqVqaf1KnA' },
        ]},
        { title: 'Database & Auth', videos: [
          { title: 'MongoDB with Mongoose', desc: 'Connect to MongoDB and perform CRUD operations.', url: 'https://www.youtube.com/watch?v=fgTGADljAeg' },
          { title: 'JWT Authentication', desc: 'Implement secure token-based authentication.', url: 'https://www.youtube.com/watch?v=mbsmsi7l3r4' },
        ]},
      ],
    },
    {
      title: 'REST API Design & Best Practices',
      slug: 'rest-api-design',
      description: 'Design clean, scalable REST APIs. Learn resource naming, versioning, pagination, rate limiting, and API documentation with Swagger.',
      price: 599, is_free: false,
      sections: [
        { title: 'API Design Principles', videos: [
          { title: 'RESTful Design Conventions', desc: 'Name resources, use HTTP verbs, and structure responses.', url: 'https://www.youtube.com/watch?v=Q-BpqyOT3a8' },
          { title: 'Pagination, Filtering & Sorting', desc: 'Handle large datasets with query parameters.', url: 'https://www.youtube.com/watch?v=M7w_MsgaPy0' },
          { title: 'API Versioning Strategies', desc: 'Version your API without breaking existing clients.', url: 'https://www.youtube.com/watch?v=MiOSLbVUaEA' },
        ]},
        { title: 'Documentation & Security', videos: [
          { title: 'Swagger / OpenAPI Documentation', desc: 'Auto-generate interactive API docs.', url: 'https://www.youtube.com/watch?v=YmQe78bSOEE' },
          { title: 'Rate Limiting & API Security', desc: 'Protect APIs from abuse with throttling and auth.', url: 'https://www.youtube.com/watch?v=ZGymN8aFsv4' },
        ]},
      ],
    },

    // ── Cloud Computing ──────────────────────────────────────────
    {
      title: 'AWS Cloud Practitioner Essentials',
      slug: 'aws-cloud-practitioner',
      description: 'Prepare for the AWS Cloud Practitioner certification. Understand EC2, S3, IAM, Lambda, and core AWS services and pricing models.',
      price: 0, is_free: true,
      sections: [
        { title: 'AWS Core Services', videos: [
          { title: 'Introduction to Cloud Computing', desc: 'Understand cloud models: IaaS, PaaS, SaaS.', url: 'https://www.youtube.com/watch?v=mxT233EdY5c' },
          { title: 'EC2, S3 & IAM Overview', desc: 'Launch instances, store objects, and manage access.', url: 'https://www.youtube.com/watch?v=ulprqHHWlng' },
          { title: 'AWS Lambda & Serverless', desc: 'Run code without managing servers using Lambda.', url: 'https://www.youtube.com/watch?v=eOBq__h4OJ4' },
        ]},
        { title: 'Architecture & Pricing', videos: [
          { title: 'AWS Well-Architected Framework', desc: 'Design reliable, secure, and cost-optimized systems.', url: 'https://www.youtube.com/watch?v=x6DIk0_2Goo' },
          { title: 'AWS Pricing & Free Tier', desc: 'Understand billing models and use the free tier wisely.', url: 'https://www.youtube.com/watch?v=kld68Lzm4bE' },
        ]},
      ],
    },
    {
      title: 'Docker & Kubernetes for Developers',
      slug: 'docker-kubernetes',
      description: 'Containerize applications with Docker and orchestrate them with Kubernetes. Learn volumes, networking, pods, deployments, and services.',
      price: 899, is_free: false,
      sections: [
        { title: 'Docker Fundamentals', videos: [
          { title: 'What is Docker? Containers Explained', desc: 'Understand containers vs VMs and Docker architecture.', url: 'https://www.youtube.com/watch?v=Gjnup-PuquQ' },
          { title: 'Dockerfile & Building Images', desc: 'Write Dockerfiles and build custom images.', url: 'https://www.youtube.com/watch?v=pTFZFxd4hOI' },
          { title: 'Docker Compose for Multi-Container Apps', desc: 'Orchestrate multiple services with docker-compose.', url: 'https://www.youtube.com/watch?v=HG6yIjZapSA' },
        ]},
        { title: 'Kubernetes Basics', videos: [
          { title: 'Kubernetes Architecture & Pods', desc: 'Understand the control plane, nodes, and pods.', url: 'https://www.youtube.com/watch?v=s_o8dwzRlu4' },
          { title: 'Deployments, Services & Scaling', desc: 'Deploy apps and expose them with Kubernetes services.', url: 'https://www.youtube.com/watch?v=EQNO_kM96Mo' },
        ]},
      ],
    },

    // ── Additional Tech ──────────────────────────────────────────
    {
      title: 'DevOps Engineering Fundamentals',
      slug: 'devops-fundamentals',
      description: 'Master the DevOps culture — CI/CD pipelines, infrastructure as code, monitoring, and automated deployments with GitHub Actions and Terraform.',
      price: 799, is_free: false,
      sections: [
        { title: 'CI/CD Pipelines', videos: [
          { title: 'What is DevOps?', desc: 'Understand DevOps principles and the software lifecycle.', url: 'https://www.youtube.com/watch?v=Xrgk023l4lI' },
          { title: 'GitHub Actions for CI/CD', desc: 'Automate build, test, and deploy workflows.', url: 'https://www.youtube.com/watch?v=R8_veQiYBjI' },
          { title: 'Infrastructure as Code with Terraform', desc: 'Provision cloud resources declaratively.', url: 'https://www.youtube.com/watch?v=l5k1ai_GBDE' },
        ]},
        { title: 'Monitoring & Logging', videos: [
          { title: 'Monitoring with Prometheus & Grafana', desc: 'Collect metrics and build real-time dashboards.', url: 'https://www.youtube.com/watch?v=9TJx7QTrTyo' },
          { title: 'Centralized Logging with ELK Stack', desc: 'Aggregate logs with Elasticsearch, Logstash, and Kibana.', url: 'https://www.youtube.com/watch?v=4X0WLg05ASw' },
        ]},
      ],
    },
    {
      title: 'Data Structures & Algorithms in Python',
      slug: 'dsa-python',
      description: 'Ace coding interviews with a comprehensive guide to arrays, linked lists, trees, graphs, sorting, searching, and dynamic programming.',
      price: 0, is_free: true,
      sections: [
        { title: 'Linear Data Structures', videos: [
          { title: 'Arrays & Linked Lists', desc: 'Implement and compare sequential data structures.', url: 'https://www.youtube.com/watch?v=pmN9ExDf3yQ' },
          { title: 'Stacks & Queues', desc: 'LIFO and FIFO data structures with real examples.', url: 'https://www.youtube.com/watch?v=A3ZUpyrnCbM' },
          { title: 'Hash Tables & Dictionaries', desc: 'Understand hashing, collisions, and lookups.', url: 'https://www.youtube.com/watch?v=ea8BRGxGmlA' },
        ]},
        { title: 'Trees, Graphs & Algorithms', videos: [
          { title: 'Binary Trees & BST', desc: 'Traverse and search binary trees efficiently.', url: 'https://www.youtube.com/watch?v=fAAZixBzIAI' },
          { title: 'Graph Traversal: BFS & DFS', desc: 'Explore graphs with breadth-first and depth-first search.', url: 'https://www.youtube.com/watch?v=tWVWeAqZ0WU' },
          { title: 'Sorting Algorithms Compared', desc: 'Bubble, merge, quick sort – when to use which.', url: 'https://www.youtube.com/watch?v=pkkFqlG0Hds' },
        ]},
      ],
    },
    {
      title: 'Git & GitHub for Team Collaboration',
      slug: 'git-github-collaboration',
      description: 'Master version control with Git — branching, merging, rebasing, pull requests, and collaborative workflows for modern development teams.',
      price: 0, is_free: true,
      sections: [
        { title: 'Git Essentials', videos: [
          { title: 'Installing Git & Basic Commands', desc: 'Set up Git and learn init, add, commit, and push.', url: 'https://www.youtube.com/watch?v=RGOj5yH7evk' },
          { title: 'Branching & Merging', desc: 'Work on features in parallel with branches.', url: 'https://www.youtube.com/watch?v=e9lnsKot_SQ' },
          { title: 'Resolving Merge Conflicts', desc: 'Handle conflicts when merging code changes.', url: 'https://www.youtube.com/watch?v=xNVM5UxlFSA' },
        ]},
        { title: 'GitHub Workflows', videos: [
          { title: 'Pull Requests & Code Reviews', desc: 'Collaborate with pull requests and review workflows.', url: 'https://www.youtube.com/watch?v=rgbCcBNZcdQ' },
          { title: 'GitHub Actions & Automation', desc: 'Automate workflows with GitHub Actions.', url: 'https://www.youtube.com/watch?v=R8_veQiYBjI' },
        ]},
      ],
    },
  ];

  // ============================================================
  //  INSERT DATA
  // ============================================================
  let totalSubjects = 0;
  let totalSections = 0;
  let totalVideos = 0;

  const getYouTubeID = (url) => {
    if (!url) return null;
    const regExp = /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  for (const course of courses) {
    // Determine thumbnail from the first video
    let thumbUrl = null;
    if (course.sections.length > 0 && course.sections[0].videos.length > 0) {
      const firstVideoUrl = course.sections[0].videos[0].url;
      const ytId = getYouTubeID(firstVideoUrl);
      if (ytId) {
        thumbUrl = `https://img.youtube.com/vi/${ytId}/0.jpg`;
      }
    }

    // Insert subject
    const [subjectResult] = await conn.execute(
      `INSERT INTO subjects (title, slug, description, price, is_free, is_published, thumbnail_url)
       VALUES (?, ?, ?, ?, ?, 1, ?)`,
      [course.title, course.slug, course.description, course.price, course.is_free ? 1 : 0, thumbUrl]
    );
    const subjectId = subjectResult.insertId;
    totalSubjects++;

    // Insert sections & videos
    for (let si = 0; si < course.sections.length; si++) {
      const section = course.sections[si];
      const [sectionResult] = await conn.execute(
        `INSERT INTO sections (subject_id, title, order_index) VALUES (?, ?, ?)`,
        [subjectId, section.title, si + 1]
      );
      const sectionId = sectionResult.insertId;
      totalSections++;

      for (let vi = 0; vi < section.videos.length; vi++) {
        const video = section.videos[vi];
        await conn.execute(
          `INSERT INTO videos (section_id, title, description, youtube_url, order_index) VALUES (?, ?, ?, ?, ?)`,
          [sectionId, video.title, video.desc, video.url, vi + 1]
        );
        totalVideos++;
      }
    }

    console.log(`  ✅ ${course.title} (${course.is_free ? 'FREE' : '₹' + course.price})`);
  }

  console.log('');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`📚 Subjects: ${totalSubjects}`);
  console.log(`📂 Sections: ${totalSections}`);
  console.log(`🎥 Videos:   ${totalVideos}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🎉 Database seeded successfully!');

  await conn.end();
}

seed().catch(err => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
