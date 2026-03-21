'use client';

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export function useAuth() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isAuth, setIsAuth] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    
    if (!token) {
      router.replace("/login");
    } else {
      setIsAuth(true);
    }
    
    setLoading(false);
  }, [router]);

  return { loading, isAuth };
}
