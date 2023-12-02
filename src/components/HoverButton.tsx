import React from "react";
import {css} from "@emotion/react";

export const HoverButton = (props: any) => {
    const { children, style, className } = props;
    return (
        <div css={css`background: #ebebed; :hover { background: #dfdfe0; }; cursor: default;`} className={`flex justify-center items-center ${className || ""}`} style={{ ...style}}>
            {children}
        </div>
    )
}