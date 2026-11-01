import { Composition } from "remotion";
import {
  BarChart,
  Comparison,
  Diagram,
  EndScreen,
  FakeUI,
  Highlight,
  List,
  LowerThird,
  Title,
} from "./kit/components";

const base = { fps: 24, width: 1920, height: 1080, durationInFrames: 120 };

// Override the example text with --props and the length with --frames at render time.
export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition {...base} id="Title" component={Title} defaultProps={{ title: "Titolo del video", subtitle: "Sottotitolo" }} />
      <Composition {...base} id="LowerThird" component={LowerThird} defaultProps={{ name: "Nome Cognome", role: "Ruolo" }} />
      <Composition {...base} id="Highlight" component={Highlight} defaultProps={{ text: "Questa parola conta", word: "parola" }} />
      <Composition {...base} id="List" component={List} defaultProps={{ title: "Tre punti", items: ["Primo punto", "Secondo punto", "Terzo punto"] }} />
      <Composition {...base} id="Comparison" component={Comparison} defaultProps={{ title: "Prima e dopo", left: { label: "Prima", items: ["Lento", "Manuale"] }, right: { label: "Dopo", items: ["Veloce", "Automatico"] } }} />
      <Composition {...base} id="Diagram" component={Diagram} defaultProps={{ title: "Come funziona", steps: ["Registra", "Monta", "Pubblica"] }} />
      <Composition id="DiagramVertical" component={Diagram} fps={25} width={1080} height={1920} durationInFrames={50} defaultProps={{ title: "La cartella", steps: ["Raw", "Edit"], stagger: 8 }} />
      <Composition {...base} id="BarChart" component={BarChart} defaultProps={{ title: "Risultati", unit: "%", data: [{ label: "Gennaio", value: 40 }, { label: "Febbraio", value: 65 }, { label: "Marzo", value: 90 }] }} />
      <Composition {...base} id="FakeUI" component={FakeUI} defaultProps={{ windowTitle: "Terminale", command: "npm run build", output: ["Compilazione in corso", "Fatto"] }} />
      <Composition {...base} id="EndScreen" component={EndScreen} defaultProps={{ title: "Grazie per aver guardato", cta: "Iscriviti al canale" }} />
    </>
  );
};
