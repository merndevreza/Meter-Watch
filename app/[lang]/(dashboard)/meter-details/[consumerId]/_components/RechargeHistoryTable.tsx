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
import { Badge } from "@/components/ui/badge";
import { ScrapedRechargeRecord } from "@/types";

export function RechargeHistoryTable({
  data,
}: {
  data: ScrapedRechargeRecord[] | undefined;
}) {
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recharge History</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No recharge history available</p>
        </CardContent>
      </Card>
    );
  }

  const getStatusBadgeVariant = (status: string) => {
    if (status.toLowerCase().includes("success") || status.toLowerCase().includes("completed")) {
      return "default";
    }
    if (status.toLowerCase().includes("failed") || status.toLowerCase().includes("error")) {
      return "destructive";
    }
    if (status.toLowerCase().includes("pending")) {
      return "secondary";
    }
    return "outline";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recharge History</CardTitle>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Recharge Date</TableHead>
              <TableHead>Serial No</TableHead>
              <TableHead>Token</TableHead>
              <TableHead>Recharge Method</TableHead>
              <TableHead className="text-right">Electricity Amount</TableHead>
              <TableHead className="text-right">Recharge Amount</TableHead>
              <TableHead className="text-right">Estimated Energy (kWh)</TableHead>
              <TableHead className="text-right">Meter Rent</TableHead>
              <TableHead className="text-right">Demand Charge</TableHead>
              <TableHead className="text-right">VAT</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((recharge) => (
              <TableRow key={`${recharge.serialNo}-${recharge.rechargeDate}`}>
                <TableCell className="font-medium">
                  {new Date(recharge.rechargeDate).toLocaleDateString()}
                </TableCell>
                <TableCell className="font-mono text-sm">{recharge.serialNo}</TableCell>
                <TableCell className="font-mono text-sm">{recharge.token}</TableCell>
                <TableCell>{recharge.rechargeMethod}</TableCell>
                <TableCell className="text-right">{recharge.electricityAmount}</TableCell>
                <TableCell className="text-right font-medium">{recharge.rechargeAmount}</TableCell>
                <TableCell className="text-right">{recharge.estimatedEnergyKwh}</TableCell>
                <TableCell className="text-right">{recharge.meterRent}</TableCell>
                <TableCell className="text-right">{recharge.demandCharge}</TableCell>
                <TableCell className="text-right">{recharge.vat}</TableCell>
                <TableCell>
                  <Badge variant={getStatusBadgeVariant(recharge.remoteRechargeStatus)}>
                    {recharge.remoteRechargeStatus}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
