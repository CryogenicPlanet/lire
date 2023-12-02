import { createRoot } from "react-dom/client";
import Content from "./content";

const root = document.createElement("div");
root.id = "crx-root";
document.body.append(root);

createRoot(root).render(<Content />);
