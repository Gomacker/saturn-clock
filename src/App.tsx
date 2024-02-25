import {ReactNode, useEffect, useState} from 'react'
import './App.css'
import './test.css'
import {css} from "@emotion/css"
import {Button, Card, Divider} from "@mui/material";
import {ClipboardFormat} from "../electron/libs/clipboard-native";


let test = false;

function App(): ReactNode {
    const [content, setContent] = useState<{formats: ClipboardFormat[], buffers: {[key: string]: Buffer}}>({formats: [], buffers: {}})
    const [utf8Content, setUtf8Content] = useState<{ [key: string]: string }>({})

    useEffect(() => {
        if (!test) {
            test = true
            setInterval(() => {
                window.ipcRenderer.send('getClipboard')
            }, 3000);
            window.ipcRenderer.on('clipboardContent', (event, _content) => {
                console.log(_content)
                setContent(_content)
                // Object.entries(_content.buffers).forEach(([key, value]: [string, Uint8Array]) => {
                //     (new Blob([value])).text().then(value1 => {
                //         setUtf8Content({...utf8Content, [key]: value1})
                //     })
                // })
            })
        }
    }, []);
    // return (
    //     <div className={css`
    //         //background: red;
    //         height: 100vh;
    //         width: 100vw;
    //         //background: lightcoral;
    //         border-radius: 4px;
    //         overflow: hidden;
    //         display: flex;
    //         justify-content: center;
    //         align-items: center;
    //     `}>
    //         <div className={css`width: 180px`}>
    //             {content.formats.map((format, key) => (
    //                 <Card key={key}>
    //                     <div className={css`
    //                     background: lightcoral;
    //                     color: white;
    //                     padding: 2px 4px;
    //                 `}>
    //                         {format.name || format.id}
    //                     </div>
    //                     <Divider/>
    //                     <div>
    //                         {content.utf8Content[format.id]}
    //                     </div>
    //                 </Card>
    //             ))}
    //         </div>
    //     </div>
    // )
    return "dfff"
}

export default App
