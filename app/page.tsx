"use client"
import { useUser } from "@auth0/nextjs-auth0/client";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  const { user } = useUser()

  return (
    <div>
      {user &&
        <Link href="/api/auth/logout">Logout</Link>

      }
      <br /><br /><br /><br /><br />
      {!user && (
        <Link href={'/api/auth/login'}>Login</Link>
      )}
      {user && (
        <div>
          <h2>{user.name}</h2>
          <p>{user.email}</p>
          <Link href={'/inbox'}>Inbox</Link>
        </div>
      )}
    </div>
  );
}
