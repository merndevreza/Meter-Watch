"use client";

import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MonthlyConsumptionType } from "@/types/monthly-consumption-type";

export function MonthlyConsumptionTable({
  data,
}: {
  data: MonthlyConsumptionType[] | undefined;
}) {
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Monthly Consumption</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No monthly consumption data available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Monthly Consumption</CardTitle>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Year</TableHead>
              <TableHead>Month</TableHead>
              <TableHead className="text-right">Energy Usage (kWh)</TableHead>
              <TableHead className="text-right">Total Recharge</TableHead>
              <TableHead className="text-right">Meter Rent</TableHead>
              <TableHead className="text-right">Demand Charge</TableHead>
              <TableHead className="text-right">PFC Charge</TableHead>
              <TableHead className="text-right">Rebate</TableHead>
              <TableHead className="text-right">VAT</TableHead>
              <TableHead className="text-right">Month End Balance</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((consumption) => (
              <TableRow key={consumption.id}>
                <TableCell className="font-medium">{consumption.year}</TableCell>
                <TableCell>{consumption.month}</TableCell>
                <TableCell className="text-right">{consumption.energyUsageKwh}</TableCell>
                <TableCell className="text-right">{consumption.totalRecharge}</TableCell>
                <TableCell className="text-right">{consumption.meterRent}</TableCell>
                <TableCell className="text-right">{consumption.demandCharge}</TableCell>
                <TableCell className="text-right">{consumption.pfcCharge}</TableCell>
                <TableCell className="text-right">{consumption.rebate}</TableCell>
                <TableCell className="text-right">{consumption.vat}</TableCell>
                <TableCell className="text-right font-medium">
                  {consumption.monthEndMeterBalance}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
