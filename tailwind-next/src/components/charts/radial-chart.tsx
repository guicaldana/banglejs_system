"use client"

import {
  Label,
  PolarGrid,
  PolarRadiusAxis,
  RadialBar,
  RadialBarChart,
} from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { ChartConfig, ChartContainer } from "@/components/ui/chart"


const chartConfig = {
  visitors: {
    label: "Visitors",
  },
  safari: {
    label: "Safari",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig

interface RadialChartComponentProps {
    steps: number;
    date: string;
    hour: string;
}
export function RadialChartComponent({
    steps,
    date,
    hour,
}: RadialChartComponentProps){

const chartData = [
    {steps: steps, fill: "var(--color-safari)" },
    ]
const stepsGoal = 10000


const chartAngle = (steps/stepsGoal) * 360
  return (
    <Card className="flex flex-col dark:border-gray-600 dark:bg-gray-900">
      <CardHeader className="items-center pb-0">
        <CardTitle>Passos</CardTitle>
        <CardDescription>Data: {date}</CardDescription>
        <CardDescription>Hora: {hour}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[250px]"
        >
          <RadialBarChart
            data={chartData}
            endAngle={chartAngle}
            innerRadius={80}
            outerRadius={140}
          >
            <PolarGrid
              gridType="circle"
              radialLines={false}
              stroke="none"
              className="first:fill-muted last:fill-background last:dark:fill-gray-900  first:dark:fill-black"
              polarRadius={[86, 74]}
            />
            <RadialBar dataKey="steps" background />
            <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy}
                          className="fill-foreground text-4xl font-bold"
                        >
                          {chartData[0].steps.toLocaleString()}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 24}
                          className="fill-muted-foreground"
                        >
                          Passos
                        </tspan>
                      </text>
                    )
                  }
                }}
              />
            </PolarRadiusAxis>
          </RadialBarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        <div className="flex items-center gap-2 font-medium leading-none">
          Meta de passos:
        </div>
        <div className="leading-none text-muted-foreground">
        {stepsGoal} passos
        </div>
      </CardFooter>
    </Card>
  )
}
