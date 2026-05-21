"use client";

import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Mic,
  Brain,
  Cctv,
  FileText,
  TrendingUp,
  Keyboard,
  AlertCircle,
  Sparkles,
  ChevronRight,
  Circle,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";

interface HelpDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function HelpDialog({ open, onOpenChange }: HelpDialogProps) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) {
        onOpenChange(false);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onOpenChange]);

  const tabs = [
    { id: "quick", label: "快速上手", icon: Zap },
    { id: "features", label: "核心功能", icon: Sparkles },
    { id: "auto", label: "智能录音", icon: Brain },
    { id: "shortcuts", label: "快捷键", icon: Keyboard },
    { id: "faq", label: "常见问题", icon: AlertCircle },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] p-0 gap-0 bg-card border-border overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-2">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <Sparkles className="size-5 text-primary" />
              MindNote 使用指南
            </DialogTitle>
            <Button variant="ghost" size="icon-sm" onClick={() => onOpenChange(false)}>
              <X className="size-4" />
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            ADHD 专属设计 · 3秒找到你需要的功能
          </p>
        </DialogHeader>

        <Tabs defaultValue="quick" className="flex flex-col flex-1 min-h-0">
          <TabsList className="px-6 justify-start gap-1 bg-transparent border-b border-border rounded-none pb-0 pt-2 overflow-x-auto">
            {tabs.map((tab) => (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-3 pb-2 text-sm font-medium whitespace-nowrap"
              >
                <tab.icon className="size-3.5 mr-1.5" />
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          <ScrollArea className="flex-1 px-6 py-4 max-h-[55vh]">
            <TabsContent value="quick" className="mt-0 space-y-6">
              <QuickStart />
            </TabsContent>

            <TabsContent value="features" className="mt-0 space-y-6">
              <FeaturesGuide />
            </TabsContent>

            <TabsContent value="auto" className="mt-0 space-y-6">
              <AutoRecordGuide />
            </TabsContent>

            <TabsContent value="shortcuts" className="mt-0">
              <ShortcutsGuide />
            </TabsContent>

            <TabsContent value="faq" className="mt-0">
              <FAQGuide />
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

function Step({ emoji, text }: { emoji: string; text: string }) {
  return (
    <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/30 border border-border/50 hover:border-primary/30 transition-colors">
      <span className="text-2xl shrink-0">{emoji}</span>
      <p className="text-sm leading-relaxed pt-0.5">{text}</p>
    </div>
  );
}

function QuickStart() {
  return (
    <div className="space-y-4">
      <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
        <p className="text-sm font-semibold text-primary mb-1">只需要3步，马上开始 👇</p>
      </div>
      <Step emoji="1️⃣" text="打开网站 → 点击中间<b>大大的麦克风按钮</b>→ 开始说话" />
      <Step emoji="2️⃣" text="说完再次点击按钮 → AI 会<b>自动</b>帮你整理成结构化笔记" />
      <Step emoji="3️⃣" text="点击右上角 🐧 → 开启注意力监工 → 专注时<b>自动录音</b>" />
      <div className="p-3 rounded-lg bg-accent/10 border border-accent/20 text-center text-sm">
        <Zap className="size-4 text-accent inline mr-1" />
        <b>就是这样！</b>不需要看任何教程，直接开始用就行。
      </div>
    </div>
  );
}

function FeaturesGuide() {
  return (
    <div className="space-y-6">
      {/* Voice */}
      <div>
        <h3 className="text-sm font-semibold flex items-center gap-2 mb-3">
          <Mic className="size-4 text-primary" /> 语音转写
        </h3>
        <div className="space-y-2 pl-6">
          {[
            "点击中间的大麦克风按钮 → 开始录音",
            "说话时文字会实时显示在屏幕上",
            "再次点击按钮停止录音",
            "支持中文和英文双语识别",
          ].map((text, i) => (
            <div key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
              <ChevronRight className="size-3 mt-0.5 shrink-0 text-primary" />
              <span>{text}</span>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      {/* AI */}
      <div>
        <h3 className="text-sm font-semibold flex items-center gap-2 mb-3">
          <Brain className="size-4 text-primary" /> AI 自动整理
        </h3>
        <div className="p-3 rounded-lg bg-primary/5 border border-primary/10 mb-3">
          <p className="text-xs font-semibold">这是 MindNote 最核心的功能</p>
        </div>
        <div className="space-y-2 pl-6">
          {[
            "录音停止后，AI <b>自动</b>整理你的笔记",
            "自动提取：标题、要点、待办事项、日期",
            "点击「原始文本」可以切换回你说的原话",
            "点击「重新整理」可以让 AI 再整理一次",
          ].map((text, i) => (
            <div key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
              <ChevronRight className="size-3 mt-0.5 shrink-0 text-primary" />
              <span dangerouslySetInnerHTML={{ __html: text }} />
            </div>
          ))}
        </div>
      </div>

      <Separator />

      {/* Pet */}
      <div>
        <h3 className="text-sm font-semibold flex items-center gap-2 mb-3">
          <Cctv className="size-4 text-primary" /> 动漫注意力监工
        </h3>
        <div className="space-y-2 pl-6">
          {[
            "点击右上角 🐧 图标开启监工",
            "授权摄像头权限（所有数据在本地，<b>不会上传</b>）",
            "专注时监工安静陪伴，走神时温柔提醒",
            "超过 15 秒走神，监工会轻轻敲屏幕",
            "再次点击 🐧 可以随时关闭",
          ].map((text, i) => (
            <div key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
              <ChevronRight className="size-3 mt-0.5 shrink-0 text-primary" />
              <span dangerouslySetInnerHTML={{ __html: text }} />
            </div>
          ))}
        </div>
      </div>

      <Separator />

      {/* Notes */}
      <div>
        <h3 className="text-sm font-semibold flex items-center gap-2 mb-3">
          <FileText className="size-4 text-primary" /> 笔记管理
        </h3>
        <div className="space-y-2 pl-6">
          {[
            "点击左侧「新建笔记」创建新笔记",
            "点击笔记卡片查看和编辑",
            "点击标签给笔记分类",
            "点击导出按钮可以导出为 Markdown 或 PDF",
          ].map((text, i) => (
            <div key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
              <ChevronRight className="size-3 mt-0.5 shrink-0 text-primary" />
              <span>{text}</span>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      {/* Report */}
      <div>
        <h3 className="text-sm font-semibold flex items-center gap-2 mb-3">
          <TrendingUp className="size-4 text-primary" /> 每日专注报告
        </h3>
        <div className="space-y-2 pl-6">
          {[
            "自动生成每日专注时长统计",
            "显示今天注意力最好的时间段",
            "用彩色图表展示，<b>没有任何负面评价</b>",
          ].map((text, i) => (
            <div key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
              <ChevronRight className="size-3 mt-0.5 shrink-0 text-primary" />
              <span dangerouslySetInnerHTML={{ __html: text }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function AutoRecordGuide() {
  return (
    <div className="space-y-4">
      <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/20">
        <p className="text-sm font-semibold text-amber-400 flex items-center gap-2 mb-2">
          ⭐ 最强大的功能，一定要看
        </p>
        <p className="text-sm text-muted-foreground">
          开启监工后，系统会<b>全自动</b>帮你录音。你什么都不用管，专注就好。
        </p>
      </div>

      <div className="space-y-3">
        <h4 className="text-sm font-semibold">系统怎么自动工作：</h4>
        <div className="space-y-3">
          {[
            { color: "bg-emerald-500", label: "注意力 > 70", action: "自动开始录音", desc: "检测到你在认真听讲/思考" },
            { color: "bg-amber-500", label: "注意力 40-70", action: "继续录音，监工关注你", desc: "轻度分心，但还在记笔记" },
            { color: "bg-red-500", label: "注意力 < 40", action: "自动暂停录音", desc: "严重走神，暂停录音等你回来" },
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-muted/20">
              <Circle className={`size-3 mt-1 shrink-0 ${item.color.replace("bg-", "text-")}`} fill="currentColor" />
              <div>
                <div className="text-sm font-medium">{item.label} → <span className="text-primary">{item.action}</span></div>
                <div className="text-xs text-muted-foreground">{item.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      <div>
        <h4 className="text-sm font-semibold mb-3">笔记上的注意力标注：</h4>
        <div className="space-y-2">
          {[
            { color: "#10b981", label: "绿色", meaning: "高度专注" },
            { color: "#f59e0b", label: "黄色", meaning: "轻度分心" },
            { color: "#ef4444", label: "红色", meaning: "严重走神" },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="size-4 rounded-full" style={{ backgroundColor: item.color }} />
              <span className="text-sm">{item.label} = {item.meaning}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ShortcutsGuide() {
  const shortcuts = [
    { key: "空格", action: "开始 / 停止录音" },
    { key: "Ctrl + N", action: "新建笔记" },
    { key: "Ctrl + S", action: "保存当前笔记" },
    { key: "Ctrl + E", action: "导出笔记" },
    { key: "Esc", action: "关闭弹窗 / 退出专注模式" },
  ];

  return (
    <div className="space-y-2">
      {shortcuts.map((s, i) => (
        <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/20 hover:bg-muted/40 transition-colors">
          <span className="text-sm">{s.action}</span>
          <kbd className="px-3 py-1 text-xs font-mono bg-muted border border-border rounded-md text-primary">
            {s.key}
          </kbd>
        </div>
      ))}
      <p className="text-xs text-muted-foreground pt-2 text-center">
        更多快捷键开发中...
      </p>
    </div>
  );
}

function FAQGuide() {
  const faqs = [
    {
      q: "麦克风没有反应？",
      answer: [
        "<b>先试这几步（90% 的情况都能解决）：</b>",
        "1. 检查地址栏左边的 🎤 图标 → 点击 → 选择「允许」",
        "2. 刷新页面（按 F5）",
        "3. 关掉其他在用麦克风的应用（微信、腾讯会议等）",
      ],
    },
    {
      q: "摄像头没有反应？",
      answer: [
        "和麦克风一样：",
        "1. 检查地址栏左边的 📷 图标 → 点击 → 选择「允许」",
        "2. 刷新页面",
        "3. 关掉其他在用摄像头的应用",
      ],
    },
    {
      q: "AI 整理没有反应？",
      answer: [
        "<b>三个可能的原因：</b>",
        "1. 没有设置 API 密钥 → 去「设置」输入你的 DeepSeek API 密钥",
        "2. 录音太短 → 至少说 10 秒以上",
        "3. 网络问题 → 检查有没有联网",
      ],
    },
    {
      q: "笔记找不到了？",
      answer: [
        "<b>别担心，笔记不会丢：</b>",
        "1. 点击左侧「搜索」→ 输入你能记住的任何关键词",
        "2. 所有笔记都存在本地浏览器里，不会丢失",
        "3. 登录账号后，笔记会自动同步到云端",
      ],
    },
    {
      q: "注意力分数不变化？",
      answer: [
        "1. 确保你的脸在摄像头画面中，光线充足",
        "2. 不要戴墨镜或口罩",
        "3. 在设置里切换不同的 DSP 滤波算法试试",
      ],
    },
  ];

  return (
    <div className="space-y-3">
      {faqs.map((faq, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
          className="p-4 rounded-lg bg-muted/20 border border-border/50"
        >
          <h4 className="text-sm font-semibold flex items-center gap-2 mb-2">
            <AlertCircle className="size-4 text-amber-400 shrink-0" />
            {faq.q}
          </h4>
          <div className="space-y-1 pl-7">
            {faq.answer.map((line, j) => (
              <p
                key={j}
                className="text-sm text-muted-foreground"
                dangerouslySetInnerHTML={{ __html: line }}
              />
            ))}
          </div>
        </motion.div>
      ))}
    </div>
  );
}
