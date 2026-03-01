"use client";

import { useRef, useState } from "react";
import styles from "@/app/not-found.module.css";

interface TerminalEntry {
  command: string;
  responses: { type: "info" | "error" | "warning" | "success" | "system"; text: string }[];
}

const EASTER_EGG_COMMANDS: Record<
  string,
  { type: "info" | "error" | "warning" | "success" | "system"; text: string }[]
> = {
  help: [
    { type: "info", text: "利用可能なコマンド:" },
    { type: "system", text: "  help        このメッセージを表示" },
    { type: "system", text: "  status      システムステータスを確認" },
    { type: "system", text: "  recruit     公開求人を実行" },
    { type: "system", text: "  sanity      理性値を確認" },
    { type: "system", text: "  secret      ..." },
    { type: "warning", text: "  ※コマンドは小文字しか対応されていません" },
  ],
  status: [
    { type: "info", text: "PRTS v4.0.4 — Rhodes Island Pharmaceutical" },
    { type: "success", text: "基地稼働率: 99.7%  |  源石濃度: 正常" },
    { type: "warning", text: "未読メッセージ: 1件 (from: アーミヤ)" },
    { type: "system", text: "現在地: 不明な座標 (404 sector)" },
  ],
  amiya: [
    { type: "success", text: ">> アーミヤからのメッセージ <<" },
    { type: "info", text: "「ドクター、お帰りなさい！" },
    { type: "info", text: "  ここは...どこでしょう？" },
    { type: "info", text: "  大丈夫です、私がロドスまで案内します！」" },
  ],
  doctor: [
    { type: "system", text: "ドクター認証情報を照会中..." },
    { type: "success", text: "ID: Dr.████████  |  クリアランス: S" },
    { type: "warning", text: "WARNING: 記憶封印 — 一部データが欠損しています" },
    { type: "info", text: "石棺からの覚醒日: ████/██/██" },
  ],
  ドクター: [
    { type: "system", text: "ドクター認証情報を照会中..." },
    { type: "success", text: "ID: Dr.████████  |  クリアランス: S" },
    { type: "warning", text: "WARNING: 記憶封印 — 一部データが欠損しています" },
    { type: "info", text: "石棺からの覚醒日: ████/██/██" },
  ],
  sanity: [
    { type: "warning", text: "現在の理性: ██ / 180" },
    { type: "error", text: "理性が不足しています" },
    { type: "info", text: "回復まで: 404分" },
    { type: "system", text: "hint: 源石を砕けば即回復" },
  ],
  理性: [
    { type: "warning", text: "現在の理性: ██ / 135" },
    { type: "error", text: "理性が不足しています" },
    { type: "info", text: "回復まで: 404分 (なんと...)" },
    { type: "system", text: "hint: 源石を砕けば即回復" },
  ],
  recruit: [
    { type: "system", text: "公開求人を開始..." },
    { type: "system", text: "タグスキャン中... [████████░░] 80%" },
    { type: "error", text: "ERROR: 求人票が次元の狭間に消えました" },
    { type: "warning", text: "ロボットタグしか出ない日々にさよならを" },
    { type: "info", text: "正規ルートはこちら → /" },
  ],
  公開求人: [
    { type: "system", text: "公開求人を開始..." },
    { type: "system", text: "タグスキャン中... [████████░░] 80%" },
    { type: "error", text: "ERROR: 求人票が次元の狭間に消えました" },
    { type: "warning", text: "ロボットタグしか出ない日々にさよならを" },
    { type: "info", text: "正規ルートはこちら → /" },
  ],
  secret: [
    { type: "system", text: "機密データベースにアクセス中..." },
    { type: "warning", text: "[CLASSIFIED] ████████████████" },
    { type: "info", text: "...バベルの記録を探しているのですか？" },
    { type: "error", text: "アクセス拒否: クリアランスが不足しています" },
    { type: "system", text: "ケルシー医師に許可を取ってください" },
  ],
  "kal'tsit": [
    { type: "error", text: ">> ケルシーからの通信 <<" },
    { type: "info", text: "「ドクター。" },
    { type: "info", text: "  君はここにいる場合ではない。" },
    { type: "info", text: "  Mon3trに迎えを寄越そう。」" },
    { type: "warning", text: "[Mon3trの気配を感じる...]" },
  ],
  ケルシー: [
    { type: "error", text: ">> ケルシーからの通信 <<" },
    { type: "info", text: "「ドクター。" },
    { type: "info", text: "  君はここにいる場合ではない。" },
    { type: "info", text: "  Mon3trに迎えを寄越そう。」" },
    { type: "warning", text: "[Mon3trの気配を感じる...]" },
  ],
  mon3tr: [
    { type: "error", text: ">> Mon3trからの通信 <<" },
    { type: "info", text: "「ドクター。こんなところで何をしているんだ？" },
    { type: "info", text: "  早く帰ろう！ここは危険なんだ。" },
    { type: "info", text: "  ドクターとアーミヤは私が守る。約束したんだ。" },
  ],
  w: [
    { type: "warning", text: ">> 不明な発信源 <<" },
    { type: "info", text: "「あはは！ここに迷い込んだの？" },
    { type: "info", text: "  爆弾でも置いていってあげましょうか？" },
    { type: "info", text: "  ...冗談よ。たぶんね。」" },
    { type: "error", text: "⚠ 爆発物が検知されました (嘘)" },
  ],
  originium: [
    { type: "system", text: "源石データベースを参照中..." },
    { type: "info", text: "源石 (Originium): テラの万物に影響を与える鉱物" },
    { type: "warning", text: "感染リスク: ████  |  エネルギー密度: 極高" },
    { type: "info", text: "ロドス・アイランドの動力源にして、災いの根源" },
    { type: "error", text: "注意: 素手での接触は厳禁です" },
  ],
  源石: [
    { type: "system", text: "源石データベースを参照中..." },
    { type: "info", text: "源石 (Originium): テラの万物に影響を与える鉱物" },
    { type: "warning", text: "感染リスク: ████  |  エネルギー密度: 極高" },
    { type: "info", text: "ロドス・アイランドの動力源にして、災いの根源" },
    { type: "error", text: "注意: 素手での接触は厳禁です" },
  ],
  "0011": [
    { type: "system", text: "認証コード受理... ロドスアイランド正規コード確認" },
    { type: "success", text: "「たとえ闇の中でも、前に進み続けよう」" },
    { type: "info", text: "— Rhodes Island, for the silent majority —" },
  ],
  rhodes: [
    { type: "success", text: "◆ ロドス・アイランド製薬 ◆" },
    { type: "info", text: "感染者の救済と源石災害の研究を行う移動都市" },
    { type: "system", text: "乗員数: ███名  |  現在座標: 不明" },
    { type: "info", text: "「すべての感染者に、明日の未来を」" },
  ],
  exia: [
    { type: "success", text: ">> エクシアからのメッセージ <<" },
    { type: "info", text: "「やっほー！ドクター！" },
    { type: "info", text: "  404？そんなの私の銃で撃ち抜いちゃうよ！" },
    { type: "info", text: "  ...あ、アップルパイ食べる？」" },
  ],
  エクシア: [
    { type: "success", text: ">> エクシアからのメッセージ <<" },
    { type: "info", text: "「やっほー！ドクター！" },
    { type: "info", text: "  404？そんなの私の銃で撃ち抜いちゃうよ！" },
    { type: "info", text: "  ...あ、アップルパイ食べる？」" },
  ],
  texas: [
    { type: "info", text: ">> テキサスからのメッセージ <<" },
    { type: "info", text: "「...迷ったのか。」" },
    { type: "info", text: "「エクシアが向こうで待ってる。さっさと戻るぞ。」" },
    { type: "system", text: "[テキサスは興味なさそうにポッキーを差し出した]" },
  ],
  テキサス: [
    { type: "info", text: ">> テキサスからのメッセージ <<" },
    { type: "info", text: "「...迷ったのか。」" },
    { type: "info", text: "「エクシアが向こうで待ってる。さっさと戻るぞ。」" },
    { type: "system", text: "[テキサスは興味なさそうにポッキーを差し出した]" },
  ],
  clear: [],
};

const UNKNOWN_RESPONSES = [
  [
    { type: "error" as const, text: "コマンドが認識できません" },
    { type: "system" as const, text: "'help' で利用可能なコマンドを確認してください" },
  ],
  [
    { type: "error" as const, text: "不明なコマンドです" },
    { type: "warning" as const, text: "PRTSのデータベースに該当する情報がありません" },
  ],
  [
    { type: "error" as const, text: "解析失敗" },
    { type: "system" as const, text: "...ドクター、もう少しわかりやすくお願いします" },
  ],
];

const MAX_HISTORY = 8;

export default function PrtsTerminal() {
  const [history, setHistory] = useState<TerminalEntry[]>([]);
  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cmd = input.trim().toLowerCase();
    if (!cmd) return;

    if (cmd === "clear") {
      setHistory([]);
      setInput("");
      return;
    }

    const responses =
      EASTER_EGG_COMMANDS[cmd] ??
      UNKNOWN_RESPONSES[Math.floor(Math.random() * UNKNOWN_RESPONSES.length)];

    setHistory((prev) => [...prev.slice(-(MAX_HISTORY - 1)), { command: input.trim(), responses }]);
    setInput("");

    requestAnimationFrame(() => {
      bodyRef.current?.scrollTo({ top: bodyRef.current.scrollHeight, behavior: "smooth" });
    });
  };

  const focusInput = () => inputRef.current?.focus();

  return (
    <div className={styles.terminal} onClick={focusInput} role="region" aria-label="PRTS ターミナル">
      <div className={styles.terminalHeader}>
        <div className={styles.terminalDot} />
        <span className={styles.terminalTitle}>prts@rhodes-island ~</span>
      </div>
      <div className={styles.terminalBody} ref={bodyRef}>
        {/* Initial static lines */}
        <div className={styles.terminalLine}>
          <span className={styles.prompt}>$</span>
          <span>navigate --target &quot;requested_route&quot;</span>
        </div>
        <div className={styles.terminalLine}>
          <span className={styles.error}>ERROR:</span>
          <span>指定された座標は存在しません</span>
        </div>
        <div className={styles.terminalLine}>
          <span className={styles.warning}>???:</span>
          <span>ドクター、道に迷ったようね。</span>
        </div>
        <div className={styles.terminalLine}>
          <span className={styles.warning}>???:</span>
          <span>でも、今はまだ会うべき時ではないわ。</span>
        </div>
        <div className={styles.terminalLine}>
          <span className={styles.warning}>???:</span>
          <span>暗闇の中、星の光で彩られた文明の果てで私たちは再会する……きっと。</span>
        </div>
        {/* Easter egg history */}
        {history.map((entry, i) => (
          <div key={i} className={styles.historyBlock}>
            <div className={styles.historyLine}>
              <span className={styles.prompt}>$</span>
              <span>{entry.command}</span>
            </div>
            {entry.responses.map((res, j) => (
              <div key={j} className={`${styles.historyLine} ${styles.responseLine}`}>
                <span className={styles[res.type] ?? ""}>{res.text}</span>
              </div>
            ))}
          </div>
        ))}

        {/* Interactive input line */}
        <form onSubmit={handleSubmit} className={styles.inputLine}>
          <span className={styles.prompt}>$</span>
          <span className={styles.inputWrapper}>
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className={styles.terminalInput}
              spellCheck={false}
              autoComplete="off"
              autoCapitalize="off"
              aria-label="コマンドを入力"
              maxLength={50}
            />
            {!input && <span className={`${styles.cursor} ${styles.idleCursor}`} />}
          </span>
        </form>
      </div>
    </div>
  );
}
