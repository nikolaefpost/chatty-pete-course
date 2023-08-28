import React, {useEffect, useState} from 'react';
import Link from "next/link";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome"
import {faMessage, faPlus, faRightFromBracket} from "@fortawesome/free-solid-svg-icons";

export const ChatSidebar = ({chatId}) => {
    const [chatList, setChatList] = useState([])
    useEffect(() => {
        const loadChatList = async () => {
            const response = await fetch('/api/chat/getChatList',{
                method: "POST",

            });
            const json = await response.json();
            setChatList(json?.chats || []);
        }
        loadChatList()
    }, [chatId])
    return (
        <div className="bg-gray-900 text-white flex flex-col overflow-hidden">
            <Link href="/chat" className="side-menu-item bg-emerald-500 hover:bg-emerald-600">
                <FontAwesomeIcon className=" mt-[2px]" icon={faPlus}/>
                New chat
            </Link>
            <div className="flex-1 overflow-auto bg-gray-950">
                {chatList.map(chat=>(
                    <Link
                        href={`/chat/${chat._id}`}
                        key={chat._id}
                        className={`side-menu-item ${chatId === chat._id? "bg-gray-700 hover:bg-gray-700":""}`}
                    >
                        <FontAwesomeIcon className=" mt-[4px]" icon={faMessage}/>
                        {chat.title}
                    </Link>
                ))}
            </div>
            <Link href="/api/auth/logout" className="side-menu-item">
                <FontAwesomeIcon className=" mt-[3px]" icon={faRightFromBracket}/>
                Logout
            </Link>
        </div>
    );
};