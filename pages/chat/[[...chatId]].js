import Head from "next/head";
import {ChatSidebar} from "../../components/ChatSidebar";
import {useEffect, useState} from "react";
import {streamReader} from "openai-edge-stream";
import {v4 as uuid} from 'uuid';
import {Message} from "../../components/Message";
import {useRouter} from "next/router";
import {getSession} from "@auth0/nextjs-auth0";
import clientPromise from "../../lib/mongodb";
import {ObjectId} from "mongodb";


const ChatPage = ({chatId, title, messages = []}) => {

    const [newChatId, setNewChatId] = useState(null);
    const [incomingMessage, setIncomingMessage] = useState("")
    const [messageText, setMessageText] = useState("");
    const [newChatMessages, setNewChatMessages] = useState([]);
    const [generatingResponse, setGeneratingResponse] = useState(false);
    const [fullMessage, setFullMessage] = useState("");
    const [originalChatId, setOriginalChatId] = useState(chatId);
    const router = useRouter();

    const routeHasChanged = chatId !== originalChatId;

    //when our route changes
    useEffect(() => {
        setNewChatMessages([]);
        setNewChatId(null);
    }, [chatId])

    // save the newly streamed message to new chat messages
    useEffect(() => {
        if (!routeHasChanged && !generatingResponse && fullMessage) {
            setNewChatMessages(prev => [...prev, {
                _id: uuid(),
                role: "assistant",
                content: fullMessage
            }])
            setFullMessage("")
        }
    }, [generatingResponse, fullMessage, routeHasChanged])

    // if we've created a new chat
    useEffect(() => {
        if (!generatingResponse && newChatId) {
            setNewChatId(null);
            router.push(`/chat/${newChatId}`);
        }
    }, [newChatId, generatingResponse, router])

    const handleSubmit = async (e) => {
        e.preventDefault();
        setGeneratingResponse(true);
        setOriginalChatId(chatId);
        setNewChatMessages(prev => [...prev, {
            _id: uuid(),
            role: "user",
            content: messageText
        }])
        setMessageText("")

        const response = await fetch(`/api/chat/sendMessage`, {
            method: "POST",
            headers: {
                "content-type": "application/json",
            },
            body: JSON.stringify({chatId, message: messageText})
        })

        const data = response.body;

        if (!data) {
            return;
        }
        const reader = data.getReader();
        let content = "";
        await streamReader(reader, (message) => {
            console.log("MESSAGE", message);
            if (message.event === "newChatId") {
                setNewChatId(message.content);
            } else {
                setIncomingMessage(prev => `${prev}${message.content}`);
                content = content + message.content;
            }

        })
        setFullMessage(content)
        setIncomingMessage("");
        setGeneratingResponse(false);
    }

    const allMessages = [...messages, ...newChatMessages]
    return (
        <>
            <Head>
                <title>New chat</title>
            </Head>
            <div className="grid h-screen grid-cols-[260px_1fr]">
                <ChatSidebar chatId={chatId}/>
                <div className="bg-gray-700 flex flex-col overflow-hidden">
                    <div className="flex-1 flex flex-col-reverse text-white overflow-auto">
                        <div className="mb-auto ">
                            {allMessages.map(item => (
                                <Message key={item._id} role={item.role} content={item.content}/>
                            ))}
                            {!!incomingMessage && !routeHasChanged && <Message role="assistant" content={incomingMessage}/>}
                        </div>
                        {!!incomingMessage && !!routeHasChanged && <Message
                            role="notice"
                            content="Only one message at a time? Please allow any responses to complete before sending
                            another message"
                        />}

                    </div>
                    <footer className="bg-gray-800 p-10">
                        <form onSubmit={handleSubmit}>
                            <fieldset className="flex gap-2" disabled={generatingResponse}>
                                <textarea
                                    value={messageText}
                                    onChange={e => setMessageText(e.target.value)}
                                    placeholder={generatingResponse ? "" : "Send a massage ...."}
                                    className="w-full resize-none rounded-md bg-gray-700 p-2 text-white border-2
                                 border-gray-700 focus:border-emerald-500 focus:border-2 focus:bg-gray-500 box-content
                                outline-0"/>
                                <button
                                    className="btn"
                                    type="submit"
                                >Send
                                </button>
                            </fieldset>
                        </form>
                    </footer>

                </div>
            </div>
        </>
    );
};

export default ChatPage;

export const getServerSideProps = async (ctx) => {
    const chatId = ctx.params?.chatId?.[0] || null;

    if (chatId) {
        const {user} = await getSession(ctx.req, ctx.res);
        const client = await clientPromise;
        const db = client.db("ChattyPete");
        const chat = await db.collection("chats").findOne({
            userId: user.sub,
            _id: new ObjectId(chatId)
        })
        return {
            props: {
                chatId,
                title: chat.title,
                messages: chat.messages.map(message => ({
                    ...message,
                    _id: uuid()
                }))
            }
        }
    }
    return {
        props: {}
    }


}