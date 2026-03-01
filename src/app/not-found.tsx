import Link from "next/link";
import PrtsTerminal from "@/components/prts-terminal";
import styles from "./not-found.module.css";

const GHOST_TAGS = ["近距離", "火力", "支援", "生存", "範囲攻撃", "COST回復", "ロボット"];

export default function NotFound() {
  return (
    <>
      {/* Ambient Effects */}
      <div className={styles.scanlines} aria-hidden="true" />
      <div className={styles.noise} aria-hidden="true" />

      <div className={`${styles.container} ${styles.screen}`}>
        {/* Background Grid */}
        <div className={styles.grid} aria-hidden="true" />

        {/* Floating Originium Crystals */}
        <div className={styles.crystals} aria-hidden="true">
          <div className={styles.crystal} />
          <div className={styles.crystal} />
          <div className={styles.crystal} />
          <div className={styles.crystal} />
          <div className={styles.crystal} />
          <div className={styles.crystal} />
        </div>

        {/* Radar Background */}
        <div className={styles.radar} aria-hidden="true">
          <div className={styles.radarRing} />
          <div className={styles.radarRing} />
          <div className={styles.radarSweep} />
        </div>

        {/* Recruitment Failed Stamp */}
        <div className={styles.stamp} aria-hidden="true">
          <span className={styles.stampText}>
            求人
            <br />
            失敗
          </span>
        </div>

        {/* Error Badge */}
        <div className={styles.errorBadge}>
          <span className={styles.statusDot} />
          ERROR 404 — ROUTE NOT FOUND
        </div>

        {/* Glitch 404 */}
        <div className={styles.glitchWrapper}>
          <h1 className={styles.glitchText} aria-label="404 ページが見つかりません">
            404
          </h1>
        </div>

        {/* PRTS Subtitle */}
        <p className={styles.subtitle}>PRTS SYSTEM NOTIFICATION</p>

        {/* Interactive PRTS Terminal */}
        <PrtsTerminal />

        {/* Scattered Ghost Tags */}
        <div className={styles.tagsArea} aria-label="無効な求人タグ">
          {GHOST_TAGS.map((tag) => (
            <span key={tag} className={`${styles.tag} ${styles.tagGhost}`}>
              {tag}
            </span>
          ))}
        </div>

        {/* Return to Base Button */}
        <Link href="/" className={styles.returnButton}>
          <span className={styles.buttonIcon} aria-hidden="true">
            ◆
          </span>
          基地に戻る
        </Link>
      </div>
    </>
  );
}
