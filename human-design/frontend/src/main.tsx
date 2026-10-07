import ReactDOM from "react-dom/client";
import App from "./App";
import { LocaleProvider } from "./locale";
import HomeCalculator from "./HomeCalculator";
import "@fontsource-variable/dm-sans";
import "./styles.css";
const root = document.getElementById("root");
const home = document.querySelector<HTMLElement>("[data-home-calculator]");
if (root)
  ReactDOM.createRoot(root).render(
    <LocaleProvider>
      <App />
    </LocaleProvider>,
  );
else if (home)
  ReactDOM.createRoot(home).render(
    <LocaleProvider>
      <HomeCalculator />
    </LocaleProvider>,
  );
