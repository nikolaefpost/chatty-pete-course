import Head from "next/head";
import {ChatSidebar} from "../../components/ChatSidebar";
import {useState} from "react";
import {streamReader} from "openai-edge-stream";

const ChatPage = () => {
    const [incomingMessage, setIncomingMessage] = useState("")
    const [messageText, setMessageText] = useState("");


    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log(messageText)
        const response = await fetch(`/api/chat/sendMessage`, {
            method: "POST",
            headers: {
                "content-type": "application/json",
            },
            body: JSON.stringify({message: messageText})
        })

        const data = response.body;

        if (!data) {
            console.log("DATA", data)
            return;
        }
        const reader = data.getReader();
        await streamReader(reader, (message) => {
            console.log("MESSAGE", message);
            setIncomingMessage(prev=>`${prev}${message.content}`)
        })

    }
    return (
        <>
            <Head>
                <title>New chat</title>
            </Head>
            <div className="grid h-screen grid-cols-[260px_1fr]">
                <ChatSidebar/>
                <div className="bg-gray-700 flex flex-col">
                    <div className="flex-1 text-white">
                        {incomingMessage}
                    </div>
                    <footer className="bg-gray-800 p-10">
                        <form onSubmit={handleSubmit}>
                            <fieldset className="flex gap-2">
                                <textarea
                                    value={messageText}
                                    onChange={e => setMessageText(e.target.value)}
                                    placeholder="Send a massage ...."
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