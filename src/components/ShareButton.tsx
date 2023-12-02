import React from "react";
import {css} from "@emotion/react";
import { IoMdShare } from "react-icons/io";
export const ShareButton = (props: any) => {
    const { children, style, className } = props;
    return (
        <div css={css`background: #3a44ff; cursor: default; :hover { background: #222cea; }; padding: 8px 16px; border-radius: 4px;`} className={`flex items-center ${className || ""}`} style={{ ...style}}>
            <div style={{color: "white"}}>Share</div>
            <div className="ml-auto">
                <IoMdShare size={20} color="white"/>
            </div>
        </div>
    )
}