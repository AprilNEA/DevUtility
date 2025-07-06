import { Trans } from "@lingui/react/macro";
import { AlertCircle, CopyCheckIcon, CopyIcon } from "lucide-react";
import { useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Helper functions for IP calculations
const ipToLong = (ip: string): number => {
  return (
    ip
      .split(".")
      .reduce((acc, octet) => (acc << 8) + Number.parseInt(octet, 10), 0) >>> 0
  );
};

const longToIp = (long: number): string => {
  return [
    (long >>> 24) & 255,
    (long >>> 16) & 255,
    (long >>> 8) & 255,
    long & 255,
  ].join(".");
};

const cidrToMask = (cidr: number): string => {
  const mask = (0xffffffff << (32 - cidr)) >>> 0;
  return longToIp(mask);
};

const maskToCidr = (mask: string): number => {
  const longMask = ipToLong(mask);
  return (longMask.toString(2).match(/1/g) || []).length;
};

interface CalculationResult {
  networkAddress: string;
  broadcastAddress: string;
  firstUsableHost: string;
  lastUsableHost: string;
  totalHosts: number | string;
  usableHosts: number | string;
  subnetMask: string;
  cidr: number | string;
}

const initialResult: CalculationResult = {
  networkAddress: "—",
  broadcastAddress: "—",
  firstUsableHost: "—",
  lastUsableHost: "—",
  totalHosts: "—",
  usableHosts: "—",
  subnetMask: "—",
  cidr: "—",
};

export default function IpPage() {
  const [subnetIp, setSubnetIp] = useState("192.168.1.10");
  const [subnetMask, setSubnetMask] = useState("255.255.255.0");
  const [subnetError, setSubnetError] = useState<string | null>(null);

  const [cidrIp, setCidrIp] = useState("10.0.5.20/24");
  const [cidrError, setCidrError] = useState<string | null>(null);

  const [result, setResult] = useState<CalculationResult>(initialResult);

  const validateIp = (ip: string): boolean => {
    const regex =
      /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    return regex.test(ip);
  };

  const handleCalculation = (
    calculationFn: () => CalculationResult | { error: string },
  ) => {
    const res = calculationFn();
    if ("error" in res) {
      setResult(initialResult);
      if (calculationFn.name.includes("Subnet")) {
        setSubnetError(res.error);
        setCidrError(null);
      } else {
        setCidrError(res.error);
        setSubnetError(null);
      }
    } else {
      setResult(res);
      setSubnetError(null);
      setCidrError(null);
    }
  };

  const calculateSubnet = (): CalculationResult | { error: string } => {
    if (!validateIp(subnetIp) || !validateIp(subnetMask)) {
      return { error: "Please enter valid IP address and subnet mask." };
    }

    try {
      const ipLong = ipToLong(subnetIp);
      const maskLong = ipToLong(subnetMask);
      const cidr = maskToCidr(subnetMask);

      if (cidr === 0 && subnetMask !== "0.0.0.0") {
        return { error: "Invalid subnet mask." };
      }

      const networkLong = (ipLong & maskLong) >>> 0;
      const broadcastLong = (networkLong | ~maskLong) >>> 0;

      const totalHosts = 2 ** (32 - cidr);
      const usableHosts = totalHosts > 2 ? totalHosts - 2 : 0;

      const firstHostLong = usableHosts > 0 ? networkLong + 1 : networkLong;
      const lastHostLong = usableHosts > 0 ? broadcastLong - 1 : broadcastLong;

      return {
        networkAddress: longToIp(networkLong),
        broadcastAddress: longToIp(broadcastLong),
        firstUsableHost: longToIp(firstHostLong),
        lastUsableHost: longToIp(lastHostLong),
        totalHosts,
        usableHosts,
        subnetMask: subnetMask,
        cidr: cidr,
      };
    } catch (_e) {
      return {
        error:
          "An error occurred during calculation. Please check your input values.",
      };
    }
  };

  const calculateCidr = (): CalculationResult | { error: string } => {
    const parts = cidrIp.split("/");
    if (parts.length !== 2 || !validateIp(parts[0])) {
      return {
        error: "Please enter a valid CIDR address (e.g., 192.168.1.1/24).",
      };
    }

    const ip = parts[0];
    const cidr = Number.parseInt(parts[1], 10);

    if (Number.isNaN(cidr) || cidr < 0 || cidr > 32) {
      return { error: "CIDR prefix must be between 0 and 32." };
    }

    try {
      const mask = cidrToMask(cidr);
      const ipLong = ipToLong(ip);
      const maskLong = ipToLong(mask);

      const networkLong = (ipLong & maskLong) >>> 0;
      const broadcastLong = (networkLong | ~maskLong) >>> 0;

      const totalHosts = 2 ** (32 - cidr);
      const usableHosts = totalHosts > 2 ? totalHosts - 2 : 0;

      const firstHostLong = usableHosts > 0 ? networkLong + 1 : networkLong;
      const lastHostLong = usableHosts > 0 ? broadcastLong - 1 : broadcastLong;

      return {
        networkAddress: longToIp(networkLong),
        broadcastAddress: longToIp(broadcastLong),
        firstUsableHost: longToIp(firstHostLong),
        lastUsableHost: longToIp(lastHostLong),
        totalHosts,
        usableHosts,
        subnetMask: mask,
        cidr: cidr,
      };
    } catch (_e) {
      return {
        error:
          "An error occurred during calculation. Please check your input values.",
      };
    }
  };

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <CardTitle>
          <Trans>IP Address Calculator</Trans>
        </CardTitle>
        <CardDescription>
          <Trans>
            For subnetting and CIDR conversion. Enter data on the left, view
            results on the right.
          </Trans>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left Column: Inputs */}
          <div className="flex flex-col">
            <Tabs defaultValue="subnet" className="flex-grow flex flex-col">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="subnet">
                  <Trans>Subnet Calculator</Trans>
                </TabsTrigger>
                <TabsTrigger value="cidr">
                  <Trans>CIDR Calculator</Trans>
                </TabsTrigger>
              </TabsList>
              <TabsContent
                value="subnet"
                className="pt-4 flex-grow flex flex-col"
              >
                <div className="space-y-4 flex-grow">
                  <div className="space-y-2">
                    <Label htmlFor="subnet-ip">
                      <Trans>IP Address</Trans>
                    </Label>
                    <Input
                      id="subnet-ip"
                      value={subnetIp}
                      onChange={(e) => setSubnetIp(e.target.value)}
                      placeholder="e.g., 192.168.1.10"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="subnet-mask">
                      <Trans>Subnet Mask</Trans>
                    </Label>
                    <Input
                      id="subnet-mask"
                      value={subnetMask}
                      onChange={(e) => setSubnetMask(e.target.value)}
                      placeholder="e.g., 255.255.255.0"
                    />
                  </div>
                </div>
                <Button
                  onClick={() => handleCalculation(calculateSubnet)}
                  className="w-full mt-4"
                >
                  <Trans>Calculate</Trans>
                </Button>
                {subnetError && (
                  <Alert variant="destructive" className="mt-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{subnetError}</AlertDescription>
                  </Alert>
                )}
              </TabsContent>
              <TabsContent
                value="cidr"
                className="pt-4 flex-grow flex flex-col"
              >
                <div className="space-y-4 flex-grow">
                  <div className="space-y-2">
                    <Label htmlFor="cidr-ip">
                      <Trans>IP Address with CIDR</Trans>
                    </Label>
                    <Input
                      id="cidr-ip"
                      value={cidrIp}
                      onChange={(e) => setCidrIp(e.target.value)}
                      placeholder="e.g., 10.0.5.20/24"
                    />
                  </div>
                </div>
                <Button
                  onClick={() => handleCalculation(calculateCidr)}
                  className="w-full mt-4"
                >
                  <Trans>Calculate</Trans>
                </Button>
                {cidrError && (
                  <Alert variant="destructive" className="mt-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{cidrError}</AlertDescription>
                  </Alert>
                )}
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Column: Results */}
          <div>
            <h3 className="text-lg font-semibold mb-4">
              <Trans>Calculation Results</Trans>
            </h3>
            <div className="flex flex-col gap-3">
              <ResultRow
                label={<Trans>Network Address</Trans>}
                value={result.networkAddress}
              />
              <ResultRow
                label={<Trans>Broadcast Address</Trans>}
                value={result.broadcastAddress}
              />
              <ResultRow
                label={<Trans>Usable Host Range</Trans>}
                value={
                  typeof result.usableHosts === "number" &&
                  result.usableHosts > 0
                    ? `${result.firstUsableHost} - ${result.lastUsableHost}`
                    : "N/A"
                }
              />
              <ResultRow
                label={<Trans>Total Hosts</Trans>}
                value={
                  typeof result.totalHosts === "number"
                    ? result.totalHosts.toLocaleString()
                    : result.totalHosts
                }
              />
              <ResultRow
                label={<Trans>Usable Hosts</Trans>}
                value={
                  typeof result.usableHosts === "number"
                    ? result.usableHosts.toLocaleString()
                    : result.usableHosts
                }
              />
              <ResultRow
                label={<Trans>Subnet Mask</Trans>}
                value={result.subnetMask}
              />
              <ResultRow
                label={<Trans>CIDR Notation</Trans>}
                value={result.cidr === "—" ? "—" : `/${result.cidr}`}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ResultRow({
  label,
  value,
}: {
  label: React.ReactNode;
  value: string;
}) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="flex items-center gap-3">
      <span className="w-28 text-sm text-muted-foreground">{label}</span>
      <Input
        className="flex-1 font-mono text-sm bg-muted"
        value={value}
        readOnly
        onFocus={(e) => e.target.select()}
      />
      <Button
        type="button"
        size="icon"
        variant="outline"
        onClick={() => {
          navigator.clipboard.writeText(value);
          setCopied(true);
          setTimeout(() => setCopied(false), 1000);
        }}
        title={copied ? "Copied" : "Copy"}
      >
        {copied ? (
          <CopyCheckIcon className="w-4 h-4" />
        ) : (
          <CopyIcon className="w-4 h-4" />
        )}
      </Button>
    </div>
  );
}
