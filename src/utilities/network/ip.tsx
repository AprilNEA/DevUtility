import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

// Helper functions for IP calculations
const ipToLong = (ip: string): number => {
  return ip.split(".").reduce((acc, octet) => (acc << 8) + Number.parseInt(octet, 10), 0) >>> 0
}

const longToIp = (long: number): string => {
  return [(long >>> 24) & 255, (long >>> 16) & 255, (long >>> 8) & 255, long & 255].join(".")
}

const cidrToMask = (cidr: number): string => {
  const mask = (0xffffffff << (32 - cidr)) >>> 0
  return longToIp(mask)
}

const maskToCidr = (mask: string): number => {
  const longMask = ipToLong(mask)
  return (longMask.toString(2).match(/1/g) || []).length
}

interface CalculationResult {
  networkAddress: string
  broadcastAddress: string
  firstUsableHost: string
  lastUsableHost: string
  totalHosts: number | string
  usableHosts: number | string
  subnetMask: string
  cidr: number | string
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
}

export default function IpPage() {
  const [subnetIp, setSubnetIp] = useState("192.168.1.10")
  const [subnetMask, setSubnetMask] = useState("255.255.255.0")
  const [subnetError, setSubnetError] = useState<string | null>(null)

  const [cidrIp, setCidrIp] = useState("10.0.5.20/24")
  const [cidrError, setCidrError] = useState<string | null>(null)

  const [result, setResult] = useState<CalculationResult>(initialResult)

  const validateIp = (ip: string): boolean => {
    const regex =
      /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/
    return regex.test(ip)
  }

  const handleCalculation = (calculationFn: () => CalculationResult | { error: string }) => {
    const res = calculationFn()
    if ("error" in res) {
      setResult(initialResult)
      if (calculationFn.name.includes("Subnet")) {
        setSubnetError(res.error)
        setCidrError(null)
      } else {
        setCidrError(res.error)
        setSubnetError(null)
      }
    } else {
      setResult(res)
      setSubnetError(null)
      setCidrError(null)
    }
  }

  const calculateSubnet = (): CalculationResult | { error: string } => {
    if (!validateIp(subnetIp) || !validateIp(subnetMask)) {
      return { error: "请输入有效的 IP 地址和子网掩码。" }
    }

    try {
      const ipLong = ipToLong(subnetIp)
      const maskLong = ipToLong(subnetMask)
      const cidr = maskToCidr(subnetMask)

      if (cidr === 0 && subnetMask !== "0.0.0.0") {
        return { error: "无效的子网掩码。" }
      }

      const networkLong = (ipLong & maskLong) >>> 0
      const broadcastLong = (networkLong | ~maskLong) >>> 0

      const totalHosts = Math.pow(2, 32 - cidr)
      const usableHosts = totalHosts > 2 ? totalHosts - 2 : 0

      const firstHostLong = usableHosts > 0 ? networkLong + 1 : networkLong
      const lastHostLong = usableHosts > 0 ? broadcastLong - 1 : broadcastLong

      return {
        networkAddress: longToIp(networkLong),
        broadcastAddress: longToIp(broadcastLong),
        firstUsableHost: longToIp(firstHostLong),
        lastUsableHost: longToIp(lastHostLong),
        totalHosts,
        usableHosts,
        subnetMask: subnetMask,
        cidr: cidr,
      }
    } catch (e) {
      return { error: "计算时发生错误。请检查输入值。" }
    }
  }

  const calculateCidr = (): CalculationResult | { error: string } => {
    const parts = cidrIp.split("/")
    if (parts.length !== 2 || !validateIp(parts[0])) {
      return { error: "请输入有效的 CIDR 地址 (例如 192.168.1.1/24)。" }
    }

    const ip = parts[0]
    const cidr = Number.parseInt(parts[1], 10)

    if (isNaN(cidr) || cidr < 0 || cidr > 32) {
      return { error: "CIDR 前缀必须在 0 到 32 之间。" }
    }

    try {
      const mask = cidrToMask(cidr)
      const ipLong = ipToLong(ip)
      const maskLong = ipToLong(mask)

      const networkLong = (ipLong & maskLong) >>> 0
      const broadcastLong = (networkLong | ~maskLong) >>> 0

      const totalHosts = Math.pow(2, 32 - cidr)
      const usableHosts = totalHosts > 2 ? totalHosts - 2 : 0

      const firstHostLong = usableHosts > 0 ? networkLong + 1 : networkLong
      const lastHostLong = usableHosts > 0 ? broadcastLong - 1 : broadcastLong

      return {
        networkAddress: longToIp(networkLong),
        broadcastAddress: longToIp(broadcastLong),
        firstUsableHost: longToIp(firstHostLong),
        lastUsableHost: longToIp(lastHostLong),
        totalHosts,
        usableHosts,
        subnetMask: mask,
        cidr: cidr,
      }
    } catch (e) {
      return { error: "计算时发生错误。请检查输入值。" }
    }
  }

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <CardTitle>IP 地址计算器</CardTitle>
        <CardDescription>用于子网划分和 CIDR 转换。在左侧输入数据，在右侧查看结果。</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left Column: Inputs */}
          <div className="flex flex-col">
            <Tabs defaultValue="subnet" className="flex-grow flex flex-col">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="subnet">子网计算器</TabsTrigger>
                <TabsTrigger value="cidr">CIDR 计算器</TabsTrigger>
              </TabsList>
              <TabsContent value="subnet" className="pt-4 flex-grow flex flex-col">
                <div className="space-y-4 flex-grow">
                  <div className="space-y-2">
                    <Label htmlFor="subnet-ip">IP 地址</Label>
                    <Input
                      id="subnet-ip"
                      value={subnetIp}
                      onChange={(e) => setSubnetIp(e.target.value)}
                      placeholder="例如: 192.168.1.10"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="subnet-mask">子网掩码</Label>
                    <Input
                      id="subnet-mask"
                      value={subnetMask}
                      onChange={(e) => setSubnetMask(e.target.value)}
                      placeholder="例如: 255.255.255.0"
                    />
                  </div>
                </div>
                <Button onClick={() => handleCalculation(calculateSubnet)} className="w-full mt-4">
                  计算
                </Button>
                {subnetError && (
                  <Alert variant="destructive" className="mt-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{subnetError}</AlertDescription>
                  </Alert>
                )}
              </TabsContent>
              <TabsContent value="cidr" className="pt-4 flex-grow flex flex-col">
                <div className="space-y-4 flex-grow">
                  <div className="space-y-2">
                    <Label htmlFor="cidr-ip">IP 地址及 CIDR</Label>
                    <Input
                      id="cidr-ip"
                      value={cidrIp}
                      onChange={(e) => setCidrIp(e.target.value)}
                      placeholder="例如: 10.0.5.20/24"
                    />
                  </div>
                </div>
                <Button onClick={() => handleCalculation(calculateCidr)} className="w-full mt-4">
                  计算
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
            <h3 className="text-lg font-semibold mb-4">计算结果</h3>
            <div className="flex flex-col gap-3">
              <ResultRow label="网络地址" value={result.networkAddress} />
              <ResultRow label="广播地址" value={result.broadcastAddress} />
              <ResultRow label="可用主机范围" value={typeof result.usableHosts === 'number' && result.usableHosts > 0 ? `${result.firstUsableHost} - ${result.lastUsableHost}` : 'N/A'} />
              <ResultRow label="总主机数" value={typeof result.totalHosts === 'number' ? result.totalHosts.toLocaleString() : result.totalHosts} />
              <ResultRow label="可用主机数" value={typeof result.usableHosts === 'number' ? result.usableHosts.toLocaleString() : result.usableHosts} />
              <ResultRow label="子网掩码" value={result.subnetMask} />
              <ResultRow label="CIDR 表示法" value={result.cidr === '—' ? '—' : `/${result.cidr}`} />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function ResultRow({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <div className="flex items-center gap-3">
      <span className="w-28 text-sm text-muted-foreground">{label}</span>
      <Input
        className="flex-1 font-mono text-sm bg-muted"
        value={value}
        readOnly
        onFocus={e => e.target.select()}
      />
      <Button
        type="button"
        size="icon"
        variant="outline"
        onClick={() => {
          navigator.clipboard.writeText(value)
          setCopied(true)
          setTimeout(() => setCopied(false), 1000)
        }}
        title={copied ? '已复制' : '复制'}
      >
        {copied ? (
          <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
        ) : (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="9" y="9" width="13" height="13" rx="2" /><rect x="3" y="3" width="13" height="13" rx="2" /></svg>
        )}
      </Button>
    </div>
  )
}
