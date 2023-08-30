import Head from "next/head";
import Link from "next/link";
import {useUser} from "@auth0/nextjs-auth0/client";
import {getSession} from "@auth0/nextjs-auth0";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome"
import {faRobot} from "@fortawesome/free-solid-svg-icons";

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
                    <div className="">
                        <FontAwesomeIcon className="text-emerald-200 text-6xl mb-2" icon={faRobot}/>
                    </div>
                    <h1 className="text-4xl font-bold">Welcome to Chatty Pete</h1>
                    <p className="text-lg mt-2">Log in your account to continue</p>
                    <div className="mt-4 flex justify-center gap-3">
                        {!user && (
                            <>
                                <Link
                                    className="btn"
                                    href="/api/auth/login"
                                >Login</Link>
                                <Link
                                    className="btn"
                                    href="/api/auth/signup"
                                >Signup</Link>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}

export const getServerSideProps = async (ctx) => {
    const session = await getSession(ctx.req, ctx.res);
    if (!!session) {
        return {
            redirect: {
                destination: "/chat"
            }
        }
    }

    return {
        props: {},
    }
}