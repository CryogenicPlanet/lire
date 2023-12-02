import React, { useEffect, useState } from "react";
import { IoMdCloseCircle, IoMdRefresh, IoMdBulb, IoMdOptions } from "react-icons/io";
import CircularSlider from "react-circular-slider-svg";
import { HoverButton } from "../../components/HoverButton";
import { css } from "@emotion/react";
import { ShareButton } from "../../components/ShareButton";
import Font from 'react-font'
import "../../index.css";
import '../../toolbox.css';

const Fonts = ["Ultra", "Roboto", "Caveat", "Lobster", "Dancing Script", "Pacifico", "Montserrat", "Open Sans", "Lato", "Raleway", "Roboto Condensed", "Roboto Slab", "Oswald", "Noto Sans", "Noto Serif", "Noto Sans JP", "Noto Sans KR", "Noto Sans SC", "Noto Sans TC", "Noto Sans Arabic"];

const Toolbar = () => (
  <div className="bg-gray-100 shadow">
    <div className="px-4 flex items-center justify-between py-2">
      <IoMdCloseCircle className="close-icon" size={18}/>
      <div className="title">
        <span className="text-14">My Boost</span>
      </div>
      <IoMdRefresh className="close-icon" size={18}/>
    </div>
  </div>
)

const Controls = () => (
  <div className="flex mt-2 justify-between">
    <HoverButton className="px-3 py-2 rounded-md">
      <IoMdBulb color="#3d3d3e" size={18}/>
    </HoverButton>
    <HoverButton className="px-3 py-2 rounded-md">
      <IoMdOptions color="#3d3d3e" size={18}/>
    </HoverButton>
    <HoverButton className="px-3 py-2 rounded-md">
      <IoMdRefresh color="#3d3d3e" size={18}/>
    </HoverButton>
  </div>
)

const FontSelector = () => (
  <div className="grid grid-cols-5 gap-2">
    {Fonts.map((font) => (
      <div className="font-selector">
        <Font family={font}>
          <div className="font-selector-text text-center" css={css`:hover { background: rgba(0,0,0, 0.1); } border-radius: 4px; cursor: default;`}>Aa</div>
        </Font>
      </div>
    ))}
  </div>
)

const ColorPicker = () => {
  const [value1, setValue1] = useState(20);
  const [size, setSize] = useState(40);
  const [isMouseDown, setIsMouseDown] = useState(false);
  const svgRef = React.useRef(null);

  useEffect(() => {
    const ref = ((svgRef?.current) as any).svgRef?.current;
    ref.style.position = "absolute";
    ref.style.top = "50%";
    ref.style.left = "50%";
    ref.style.transform = "translate(-50%, -50%)";
  }, []);

  return (
    <div className="flex justify-center">
     <div id="grad1" >
        <div className="bg-white w-full h-full relative" onMouseDown={(e) => setIsMouseDown(true)} onMouseUp={(e) => setIsMouseDown(false)} onMouseLeave={(e) => setIsMouseDown(false)}  onMouseMove={(e) => {
          if (!isMouseDown) return;
          const centerPosGrad1 = document.getElementById("grad1")?.getBoundingClientRect();
          // distance of left cornor of grad1 from the center of the circle
          const distanceFromCenter = Math.sqrt(Math.pow(centerPosGrad1!.width/2 - (e.clientX - centerPosGrad1!.left), 2) + Math.pow(centerPosGrad1!.height/2 - (e.clientY - centerPosGrad1!.top), 2));
          const maxDistance = 200;
          const size = Math.min(maxDistance, distanceFromCenter * 2);
          const minSize = 60;
          setSize(Math.max(minSize, size));
        }}>
            <CircularSlider
              ref={svgRef}
              size={size}
              trackWidth={6}
              minValue={0}
              maxValue={360}
              startAngle={0}
              endAngle={360}
              handleSize={14}
              angleType={{
                direction: "cw",
                axis: "-y"
              }}
              handle1={{
                value: value1,
                onChange: v => setValue1(v)
              }}
              arcColor="transparent"
              arcBackgroundColor="transparent"
            />
        </div>
      </div>
    </div>
  )
}

export default function BoostUI() {
  return (
    <div className="fixed right-0 bg-slate-50 z-9999 backdrop-blur-md top-1/2 w-100 rounded-md" style={{background: "#fdfdff", color: "#252526", transform: "translateY(-50%)", boxShadow: "rgba(0, 0, 0, 0.1) 0px 4px 12px", maxWidth: "240px"}}>
      <Toolbar/>
      <div className="px-4 py-2">
        <ColorPicker/>
        <div>
          <Controls/>
          <div className="mt-4 h-30 px-2 py-2" style={{ boxShadow: "rgba(0, 0, 0, 0.1) 0px 4px 12px", borderRadius: 4}}>
            <FontSelector/>
          </div>
          <div className="mt-4 flex justify-between">
            <HoverButton style={{padding: "6px 24px", borderRadius: 4 }}>
              Size
            </HoverButton>
            <HoverButton style={{padding: "6px 24px", borderRadius: 4 }}>
              Case
            </HoverButton>
          </div>
          <div className="mt-8">
            <ShareButton/>
          </div>
        </div>
      </div>
    </div>
  );
}
