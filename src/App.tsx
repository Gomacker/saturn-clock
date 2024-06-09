import {Component, ReactNode, useEffect, useState} from 'react'
import './App.css'
import './test.css'
import {css, cx} from "@emotion/css"
import {
    AppBar,
    Box,
    Button,
    Card,
    CardContent,
    Icon,
    IconButton,
    List,
    ListItem,
    ListItemButton,
    Toolbar,
    Typography
} from "@mui/material";
import {ClipboardFormat} from "../electron/libs/clipboard-native";
import * as Icons from "@mui/icons-material";


let test = false;

function InfoCard(): ReactNode {
    return (
        <Card className={css`
            position: absolute;
            bottom: 6px;
        `}>
            <CardContent className={css`
                display: flex;
                align-items: center;
            `}>
                <Icon color="info" style={{overflow: "initial", marginRight: "8px"}}>
                    <Icons.Info></Icons.Info>
                </Icon>
                <Box>
                    <div className={css`
                        font-weight: bold;
                    `}>
                        测试Info
                    </div>
                    <Typography variant="body2">
                        this is a test info content
                    </Typography>
                </Box>
            </CardContent>
        </Card>
    )
}

class InfoRegin2 extends Component<{ className?: string }> {
    info(title: string, content: string, duration: number = 5): void {

    }

    render(): ReactNode {
        return <></>
    }
}

function InfoRegin({className}: { className?: string }): ReactNode {
    return (
        <Box className={cx(
            css``,
            className
        )}>
            <InfoCard></InfoCard>
            <InfoCard></InfoCard>
            <InfoCard></InfoCard>
            <InfoCard></InfoCard>
            <InfoCard></InfoCard>
            <InfoCard></InfoCard>
            <InfoCard></InfoCard>
        </Box>
    )
}

declare interface Window {
    ipcRenderer: import('electron').IpcRenderer
}

function App(): ReactNode {
    const [content, setContent] = useState<{
        formats: ClipboardFormat[],
        buffers: { [key: string]: Buffer }
    }>({formats: [], buffers: {}})

    const [plainText, setPlainText] = useState<string>('');

    useEffect(() => {
        if (!test) {
            test = true
            window.ipcRenderer.removeAllListeners('clipboardContent')
            window.ipcRenderer.on('clipboardContent', (event, _content) => {
                console.log(_content)
                // setContent(_content)
                if (13 in _content.buffers) {
                    window.ipcRenderer.send('readUtf16', _content.buffers[13])
                }
            })

            window.ipcRenderer.on('readUtf16Callback', (event, result: string) => {
                // console.log(result)
                setPlainText(result.trim())
            })
            window.ipcRenderer.on('ansi2utf8Callback', (event, result: string) => {
                // console.log(result)
                setPlainText(result.trim())
            })
            window.ipcRenderer.send('getClipboard')
        }
    }, []);
    return <Box className={css`
        //display: flex;
        //flex-direction: column;
        //justify-content: center;
        //align-items: center;
        //border-radius: 10px;
        height: 100vh;
        width: 100vw;
        overflow: hidden;
    `}>
        <AppBar>
            <Toolbar className={css`
                -webkit-app-region: drag;
                justify-content: space-between;
            `} variant="dense">
                <Typography>Saturn Clock</Typography>
                <Button className={css`-webkit-app-region: no-drag;`} color="inherit">close</Button>
            </Toolbar>
        </AppBar>

        <Box className={css`
            //border-radius: inherit;
            display: flex;
            flex-direction: column;
            //justify-content: center;
            //align-items: center;
            height: 100%;
            width: 100%;
            background: #407183;
            //border: #ccc 1px solid;
            box-sizing: border-box;
        `}>

            <Toolbar variant="dense"/>

            <Box className={css`
                display: flex;
                flex-grow: 1;
            `}>
                <Box className={css`
                    //position: absolute;
                    padding: 8px;
                    //height: calc(100% - 16px);
                `}>
                    <Card className={css`
                        height: 100%
                    `}>
                        <List className={css`
                            width: 25vw;
                        `}>
                            {[
                                'Home',
                                'Math',
                                'Development',
                                'Image',
                                'Audio',
                                'File',
                                'Custom',
                            ].map((item) => (
                                <ListItem key={item} style={{padding: '4px'}}>
                                    <ListItemButton>
                                        {item}
                                    </ListItemButton>
                                </ListItem>
                            ))}
                        </List>
                    </Card>
                </Box>
                <Box className={css`
                    flex-grow: 1;
                    //display: grid;
                    //padding: 8px;
                    //grid-template-rows: repeat(auto-fit, 120px);
                    //grid-gap: 8px;
                `}>
                    {[
                        {name: 'origin', func: (value: any) => value},
                        {name: 'uppercase', func: (value: string) => value.toUpperCase()},
                        {name: 'lowercase', func: (value: string) => value.toLowerCase()},
                        {name: 'reversed', func: (value: string) => value.split('').reverse().join('')},
                        {
                            name: 'digital', func: (value: string) => {
                                const l = value.split(/[^0-9]/g).filter(value => !!value)
                                return parseInt(l[0]).toString()
                            }
                        },
                    ]
                        .map((value, index) => (
                            <Card key={index} className={css`
                                display: flex;
                                margin: 8px;
                                overflow: hidden;
                                height: fit-content;
                            `}>
                                <Box className={css`
                                    width: 120px;
                                    min-width: 120px;
                                    background: #53f2f2;
                                    display: flex;
                                    justify-content: center;
                                    align-items: center;
                                    //color: white;
                                    //border-radius: ;
                                    user-select: none;
                                `}>
                                    {value.name}
                                </Box>
                                <Box className={css`
                                    padding: 16px;
                                    flex-grow: 1;
                                    font-weight: bold;
                                    user-select: all;
                                    white-space: pre-wrap;
                                `}>{value.func(plainText)}</Box>
                                <Box className={css`
                                    width: 120px;
                                    background: red;
                                    padding: 8px;
                                    box-sizing: border-box;
                                    //display: grid;
                                    display: none;
                                    grid-template-columns: repeat(2, 50%);
                                    grid-template-rows: repeat(2, 50%);
                                    //grid-gap: 8px;
                                `}>
                                    <Box className={css`
                                        width: 100%;
                                        height: 100%;
                                        background: white;
                                        padding: 8px;
                                        box-sizing: border-box;
                                    `}>
                                        <IconButton>
                                            {/*<Icon>*/}
                                            {/*    */}
                                            {/*</Icon>*/}
                                        </IconButton>
                                    </Box>
                                    <Box className={css`
                                        width: 100%;
                                        height: 100%;
                                        background: white;
                                    `}>

                                    </Box>
                                </Box>
                            </Card>
                        ))}
                    {/*<Card className={css`*/}
                    {/*    padding: 16px;*/}
                    {/*`}>*/}
                    {/*    reverse: {plainText.split('').reverse().join('')}*/}
                    {/*</Card>*/}
                </Box>
            </Box>
        </Box>
        <InfoRegin className={css`
            position: fixed;
            bottom: 8px;
            right: 8px;
            width: 240px;
        `}></InfoRegin>
        <InfoRegin2></InfoRegin2>
    </Box>
}

export default App
