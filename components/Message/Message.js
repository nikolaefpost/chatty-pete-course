import React from 'react';
import {useUser} from "@auth0/nextjs-auth0/client";
import Image from "next/image";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome"
import {faRobot} from "@fortawesome/free-solid-svg-icons";
import {ReactMarkdown} from "react-markdown/lib/react-markdown.js"

export const Message = ({role, content}) => {
    const {user} = useUser();

    return (
        <div
            className={`grid grid-cols-[30px_1fr] gap-5 p-5 ${role === "assistant" ? "bg-gray-600" : role === "notice" ?
                "bg-red-600" : ""}`}>
            <div>
                {role === "user" && !!user && <Image
                    src={user.picture}
                    width={30}
                    height={30}
                    alt="user avatar"
                    className="rounded-sm shadow-md shadow-black/50"
                />}
                {role === "assistant" &&
                    <div
                        className="flex h-[30px] w-[30px] justify-center items-center rounded-sm shadow-md
                         shadow-black/50 bg-gray-800"
                    >
                        <FontAwesomeIcon icon={faRobot}/>
                    </div>
                }
            </div>
            <div className="prose prose-invert w-full">
                <ReactMarkdown>{content}</ReactMarkdown>
            </div>
        </div>
    );
};