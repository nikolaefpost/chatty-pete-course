import Head from "next/head";
import {ChatSidebar} from "../../components/ChatSidebar";
import {useEffect, useState} from "react";
import {streamReader} from "openai-edge-stream";
import {v4 as uuid} from 'uuid';
import {Message} from "../../components/Message";
import {useRouter} from "next/router";


const ChatPage = ({chatId}) => {
    const [newChatId, setNewChatId] = useState(null);
    const [incomingMessage, setIncomingMessage] = useState("")
    const [messageText, setMessageText] = useState("");
    const [newChatMessages, setNewChatMessages] = useState([]);
    const [generatingResponse, setGeneratingResponse] = useState(false);
    const router = useRouter()

    useEffect(() => {
        if (!generatingResponse && newChatId) {
            setNewChatId(null);
            router.push(`/chat/${newChatId}`);
        }
    }, [newChatId, generatingResponse, router])

    const handleSubmit = async (e) => {
        e.preventDefault();
        setGeneratingResponse(true);
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
            body: JSON.stringify({message: messageText})
        })

        const data = response.body;

        if (!data) {
            return;
        }
        const reader = data.getReader();
        await streamReader(reader, (message) => {
            console.log("MESSAGE", message);
            if (message.event === "newChat") {
                setNewChatId(message.content);
            } else {
                setIncomingMessage(prev => `${prev}${message.content}`)
            }

        })
        setGeneratingResponse(false);
    }
    return (
        <>
            <Head>
                <title>New chat</title>
            </Head>
            <div className="grid h-screen grid-cols-[260px_1fr]">
                <ChatSidebar chatId={chatId} />
                <div className="bg-gray-700 flex flex-col overflow-hidden">
                    <div className="flex-1 text-white overflow-scroll">
                        {newChatMessages.map(item => (
                            <Message key={item._id} role={item.role} content={item.content}/>
                        ))}
                        {!!incomingMessage && <Message role="assistant" content={incomingMessage}/>}
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

    return {
        props: {
            chatId
        }
    }
}