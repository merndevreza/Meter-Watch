"use client" 
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts" 
import {
  Card, 
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"  

export const description = "An interactive area chart"

const chartConfig = {
  totalUsageDeduction: {
    label: "Energy Usage",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig

export function ChartAreaInteractive({ chartData }: { chartData: { month: string, usage: number }[] }) { 
 
  const filteredData = chartData.map((item) => {
    const date = new Date(`${item.month.split('/')[1]}-${item.month.split('/')[0]}-01`)
    const monthName = date.toLocaleDateString("en-US", {
      month: "short",
      year: "numeric",
    })

    return {
      date: monthName,
      totalUsageDeduction: Number(item.usage) || 0,
    }
  })
  if (!chartData || filteredData.length === 0) {
    return (
      <Card>
      <CardHeader >
        <CardTitle className="text-lg font-semibold">Energy Usage</CardTitle> 
      </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No monthly consumption data available</p>
        </CardContent>
      </Card>
    );
  }
  return (
    <Card className="@container/card">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold">Energy Usage</CardTitle>
        <CardDescription className="text-sm text-muted-foreground">
          <span className="hidden @[540px]/card:inline">
            Total usage deduction
          </span> 
        </CardDescription>
      </CardHeader>
      <CardContent className="px-2 pt-2 sm:px-6 sm:pt-4">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-75 w-full"
        >
          <AreaChart data={filteredData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.8} />
                <stop offset="60%" stopColor="var(--color-primary)" stopOpacity={0.4} />
                <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <CartesianGrid 
              vertical={false}
              strokeDasharray="3 3"
              stroke="var(--color-border)"
              opacity={0.5}
            />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={10}
              minTickGap={32}
              style={{ fontSize: "13px" }}
            />
            <ChartTooltip
              cursor={{ fill: "var(--color-primary)", opacity: 0.1 }}
              content={
                <ChartTooltipContent
                  indicator="dot"
                  className="rounded-lg border border-border bg-card shadow-lg"
                />
              }
            />
            <Area
              dataKey="totalUsageDeduction"
              type="natural"
              fill="url(#colorGradient)"
              stroke="var(--color-primary)"
              strokeWidth={2.5}
              dot={{ fill: "var(--color-primary)", r: 4 }}
              activeDot={{ r: 6 }}
              stackId="a"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
