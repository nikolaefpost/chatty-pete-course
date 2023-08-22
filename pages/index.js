import Head from "next/head";
import Link from "next/link";
import {useUser} from "@auth0/nextjs-auth0/client";

export default function Home() {

    const {isLoading, error, user} = useUser();

    if (isLoading) return <div>Loading...</div>
    if (isLoading) return <div>{error.message}</div>
    return (
        <>
            <Head>
                <title>Chatty Pete - Login or Signup</title>
            </Head>
            <div className="flex justify-center items-center min-h-screen w-full bg-gray-800 text-white text-center">
                <div>
                    {!!user && <Link href="/api/auth/logout">Logout</Link>}
                    {!user && (
                        <>
                            <Link
                                className="rounded-md bg-emerald-500 px-4 py-2 text-white hover:bg-emerald-600 "
                                href="/api/auth/login"
                            >Login</Link>
                            <Link
                                className="rounded-md bg-emerald-500 px-4 py-2 text-white hover:bg-emerald-600 "
                                href="/api/auth/signup"
                            >Signup</Link>
                        </>
                    )}
                </div>

            </div>
        </>
    );
}