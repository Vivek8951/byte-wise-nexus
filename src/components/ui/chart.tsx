
import * as React from "react";
import { AreaChart as RechartsAreaChart, LineChart as RechartsLineChart, BarChart as RechartsBarChart, Area, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { cn } from "@/lib/utils";

// Mock data for charts when no data is provided
const defaultData = [
  { name: "Jan", value: 100 },
  { name: "Feb", value: 120 },
  { name: "Mar", value: 170 },
  { name: "Apr", value: 180 },
  { name: "May", value: 250 },
  { name: "Jun", value: 230 },
  { name: "Jul", value: 300 },
  { name: "Aug", value: 350 },
  { name: "Sep", value: 280 },
  { name: "Oct", value: 340 },
  { name: "Nov", value: 280 },
  { name: "Dec", value: 310 },
];

interface ChartProps extends React.HTMLAttributes<HTMLDivElement> {
  data?: any[];
}

export function AreaChart({ className, data = defaultData, ...props }: ChartProps) {
  return (
    <div className={cn("w-full h-full", className)} {...props}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsAreaChart data={data}>
          <defs>
            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
          <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <Tooltip />
          <Area type="monotone" dataKey="value" stroke="#8884d8" fillOpacity={1} fill="url(#colorValue)" />
        </RechartsAreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function LineChart({ className, data = defaultData, ...props }: ChartProps) {
  return (
    <div className={cn("w-full h-full", className)} {...props}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsLineChart data={data}>
          <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
          <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <Tooltip />
          <Line type="monotone" dataKey="value" stroke="#8884d8" activeDot={{ r: 8 }} />
        </RechartsLineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function BarChart({ className, data = defaultData, ...props }: ChartProps) {
  return (
    <div className={cn("w-full h-full", className)} {...props}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsBarChart data={data}>
          <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
          <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <Tooltip />
          <Bar dataKey="value" fill="#8884d8" radius={[4, 4, 0, 0]} />
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  );
}
