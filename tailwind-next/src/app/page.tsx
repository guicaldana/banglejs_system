"use client";

import { RadialChartComponent } from '@/components/charts/radial-chart';
import { ModeToggle } from '@/components/mode-toggle';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useEffect, useState } from "react";

export default function Home() {
  // Estados para armazenar os dados do sensor
  const [time, setTime] = useState<{ date: string; time: string } | null>(null);
  const [hrm, setHrm] = useState<{ bpm: number; confidence: number } | null>(
    null
  );
  const [steps, setSteps] = useState<number | null>(null);
  const [accel, setAccel] = useState<{
    x: string;
    y: string;
    z: string;
  } | null>(null);
  const [temperature, setTemperature] = useState<number | null>(null);
  const [connected, setConnected] = useState(false);

  const translateAccel = (accel: number) => {
    return (accel *9.81).toFixed(2);
  }

  const magnitude = accel
    ? Math.sqrt(
        Number(accel.x) ** 2 + Number(accel.y) ** 2 + Number(accel.z) ** 2
      )
    : 0;
    if (magnitude > 3*9.81) {
      console.log("Alerta! Possível queda ou impacto forte.");
    }

  useEffect(() => {
    if (typeof window !== "undefined") {
      const socket = new WebSocket("ws://localhost:3001");

      socket.onopen = () => {
        setConnected(true);
        console.log("Conectado ao servidor WebSocket!");
      };

      socket.onclose = () => {
        setConnected(false);
        console.log("Desconectado do servidor WebSocket.");
      };

      socket.onmessage = (event) => {
        const data = event.data;

        // Verificar se os dados recebidos são um JSON válido
        try {
          const parsedData = JSON.parse(data);
          

          // Verificar e atualizar os dados recebidos nos estados correspondentes
          if (parsedData.timestamp) setTime(parsedData.timestamp);
          if (parsedData.hrm) setHrm(parsedData.hrm);
          if (parsedData.steps !== undefined) setSteps(parsedData.steps); // Garantir que seja `undefined` ou um valor numérico
      
          if (parsedData.accel) setAccel(parsedData.accel);
          if (parsedData.temperature !== undefined)
            setTemperature(parsedData.temperature); // Verificar se a temperatura está definida
        } catch (error) {
          console.error("Erro ao parsear dados:", error);
        }
      };

      return () => {
        socket.close();
      };
    }
  }, []);

  return (
    <div className="flex h-screen w-full flex-col">
      <header className="sticky top-0 z-10 flex h-16 w-full shrink-0 items-center justify-between gap-2 border-b border-gray-200 bg-white transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12 dark:border-gray-600 dark:bg-gray-900">
        <div className="flex items-center gap-2 px-4">
          <h1 className="font-bold">Dados do Bangle.js 2 | Caio Zuqui Rezende & Guilherme Teixeira Caldana</h1>
        </div>
        <div className="flex items-center gap-2 px-8">

          <ModeToggle />
        </div>
      </header>
      <main className="flex items-center gap-2 px-4">
        <ScrollArea className="h-full w-full p-2 sm:p-4">
          <Card className=" z-10 w-full dark:border-gray-600 dark:bg-gray-900">
            <CardHeader>
              <CardDescription>Informações do dispositivo:</CardDescription>
              <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                Bangle.js 2
              </CardTitle>
              <CardDescription>Status: {connected ?  "Conectado" :  "Não conectado"}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex-col gap-2">
                <div className="font-bold">
                  <span>Sensores disponíveis:</span>
                </div>
                <div>
                  <span>Tempo</span>
                </div>
                <div>
                  <span>Batimentos cardíacos</span>
                </div>
                <div>
                  <span>Acelerômetro</span>
                </div>
              </div>
            </CardContent>
          </Card>
          <div className="w-ful grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          <div className="h-full rounded-lg p-4">
            <RadialChartComponent steps={steps ?? 0} date={time?.date ?? ''} hour={time?.time ?? ''}/>
          </div>
          <div className="h-full rounded-lg p-4">
            <Card className="flex flex-col w-full h-full dark:border-gray-600 dark:bg-gray-900">
              <CardHeader className="items-center pb-0">
                <CardTitle>Batimentos Cardíacos</CardTitle>
                <CardDescription>Data: {time?.date ?? ''}</CardDescription>
                <CardDescription>Hora: {time?.time ?? ''}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center mt-24">
                  <span className="text-4xl font-bold">
                    {hrm?.bpm ?? 0}
                  </span>
                  <span className="text-2xl font-bold">BPM</span>
                </div>
              </CardContent>
              <CardFooter className="flex-col gap-2 text-sm justify-center mt-26">
        <div className="flex items-center gap-2 font-medium leading-none">
          Confiança:
        </div>
        <div className="leading-none text-muted-foreground">
        {hrm?.confidence ?? 0}%
        </div>
      </CardFooter>
            </Card>
          </div>
          <div className="h-full rounded-lg p-4">
            <Card className="flex flex-col w-full h-full dark:border-gray-600 dark:bg-gray-900">
              <CardHeader className="items-center pb-0">
                <CardTitle>Temperatura</CardTitle>
                <CardDescription>Data: {time?.date ?? ''}</CardDescription>
                <CardDescription>Hora: {time?.time ?? ''}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center mt-24">
                  <span className="text-4xl font-bold">
                    {temperature ?? 0}
                  </span>
                  <span className="text-2xl font-bold">°C</span>
                </div>
              </CardContent>
              <CardFooter className="flex-col gap-2 text-sm justify-center mt-26">
        <div className="flex items-center gap-2 font-medium leading-none">
          Nível:
        </div>
        <div className="leading-none text-muted-foreground">
        {temperature && temperature > 37 ? "Alto" : ""}
        {temperature && temperature < 35 ? "Baixo" : ""}
        {temperature && temperature >= 35 && temperature <= 37 ? "Normal" : ""}
        </div>
      </CardFooter>
            </Card>
          </div>
          <div className="h-full rounded-lg p-4 ">
            <Card className="flex flex-col w-full h-full dark:border-gray-600 dark:bg-gray-900">
              <CardHeader className="items-center pb-0">
                <CardTitle>Acelerômetro</CardTitle>
                <CardDescription>Data: {time?.date ?? ''}</CardDescription>
                <CardDescription>Hora: {time?.time ?? ''}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center mt-16">
                <span className="text-xl font-bold"> Eixo x:</span>
                  <span className="text-4xl font-bold">
                    {accel && accel.x ? translateAccel(Number(accel.x)): 0}
                  </span>
                  <span className="text-2xl font-bold">m/s²</span>
                </div>
                <div className="flex items-center justify-center ">
                <span className="text-xl font-bold"> Eixo y:</span>
                  <span className="text-4xl font-bold">
                  {accel && accel.y ? translateAccel(Number(accel.y)): 0}
                  </span>
                  <span className="text-2xl font-bold">m/s²</span>
                </div>
                <div className="flex items-center justify-center ">
                <span className="text-xl font-bold"> Eixo z:</span>
                  <span className="text-4xl font-bold">
                  {accel && accel.z ? translateAccel(Number(accel.z)): 0}
                  </span>
                  <span className="text-2xl font-bold">m/s²</span>
                </div>
            
                  
              </CardContent>
              <CardFooter className="flex-col gap-2 text-sm justify-center mt-12">
        <div className="flex items-center gap-2 font-medium leading-none">
          Estado:
        </div>
        <div className="leading-none text-muted-foreground">
        {magnitude && magnitude > 2*9.81 ? "Alerta! Possível queda ou impacto forte." : "Pouca variação, possível estado inativo."}
        </div>
      </CardFooter>
            </Card>
          </div>
          </div>
        </ScrollArea>
        {/* <div>
        {connected ? <p>Status: Conectado</p> : <p>Status: Não conectado</p>}
      </div>
      <div>
        <h2>Dados Recebidos:</h2>
        <div>
          <strong>Tempo:</strong>
          <p>
            {time ? `Data: ${time.date}, Hora: ${time.time}` : "Aguardando..."}
          </p>
        </div>
        <div>
          <strong>Batimentos Cardíacos:</strong>
          <p>
            {hrm
              ? `BPM: ${hrm.bpm}, Confiança: ${hrm.confidence}%`
              : "Aguardando..."}
          </p>
        </div>
        <div>
          <strong>Passos:</strong>
          <p>{steps !== null ? steps : "Aguardando..."}</p>
        </div>
        <div>
          <strong>Acelerômetro:</strong>
          <p>
            {accel
              ? `X: ${accel.x}, Y: ${accel.y}, Z: ${accel.z}`
              : "Aguardando..."}
          </p>
        </div>
        <div>
          <strong>Temperatura:</strong>
          <p>{temperature !== null ? temperature : "Aguardando..."}</p>
        </div>
      </div> */}
      </main>
    </div>
  );
}
