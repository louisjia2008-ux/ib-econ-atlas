import { useEffect, useRef, useState } from "react";
import { Database, Download, FileUp, ShieldCheck, Trash2 } from "lucide-react";
import type { Locale } from "../../types/content";
import { clearLearningData, getDataCounts, getPreferences } from "../progress/db";
import { backupFilename, createBackup, importBackup, serializeBackup, type ImportMode } from "./backup";

interface DataSummary {
  progress: number;
  attempts: number;
  lastBackupAt?: string;
}

export function SettingsView({ locale }: { locale: Locale }) {
  const [summary, setSummary] = useState<DataSummary>({ progress: 0, attempts: 0 });
  const [mode, setMode] = useState<ImportMode>("merge");
  const [status, setStatus] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const refresh = async () => {
    const [counts, preferences] = await Promise.all([getDataCounts(), getPreferences()]);
    setSummary({ ...counts, ...(preferences.lastBackupAt ? { lastBackupAt: preferences.lastBackupAt } : {}) });
  };
  useEffect(() => { void refresh(); }, []);

  const exportData = async () => {
    const now = new Date();
    const envelope = await createBackup(now);
    const blob = new Blob([serializeBackup(envelope)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = backupFilename(now);
    anchor.click();
    URL.revokeObjectURL(url);
    setStatus(locale === "zh-CN" ? "备份已导出。" : "Backup exported.");
    await refresh();
  };

  const importData = async (file: File) => {
    try {
      const confirmed = mode !== "replace" || window.confirm(locale === "zh-CN" ? "全部替换会清除当前进度和练习记录。确定继续吗？" : "Replace will clear current progress and attempts. Continue?");
      if (!confirmed) return;
      const result = await importBackup(await file.text(), mode, confirmed);
      setStatus(locale === "zh-CN" ? `已导入 ${result.progress} 条进度和 ${result.attempts} 次练习。` : `Imported ${result.progress} progress records and ${result.attempts} attempts.`);
      await refresh();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : String(error));
    } finally {
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const clearData = async () => {
    const confirmed = window.confirm(locale === "zh-CN" ? "确定清除这台设备上的全部学习数据吗？此操作不可撤销。" : "Clear all learning data on this device? This cannot be undone.");
    if (!confirmed) return;
    await clearLearningData();
    setStatus(locale === "zh-CN" ? "本地学习数据已清除。" : "Local learning data cleared.");
    await refresh();
  };

  return (
    <section className="dashboard-view settings-view">
      <span className="eyebrow">{locale === "zh-CN" ? "隐私优先" : "Privacy first"}</span>
      <h1>{locale === "zh-CN" ? "设置与数据" : "Settings and data"}</h1>
      <p className="dashboard-lead">{locale === "zh-CN" ? "无需账号。进度默认留在浏览器中，并可通过 JSON 备份迁移。" : "No account is required. Progress stays in the browser and can move through a JSON backup."}</p>
      <div className="data-summary">
        <Database />
        <div><strong>{summary.progress}</strong><span>{locale === "zh-CN" ? "知识点记录" : "progress records"}</span></div>
        <div><strong>{summary.attempts}</strong><span>{locale === "zh-CN" ? "练习记录" : "practice attempts"}</span></div>
        <div><strong>{summary.lastBackupAt ? new Date(summary.lastBackupAt).toLocaleDateString(locale) : "—"}</strong><span>{locale === "zh-CN" ? "最后备份" : "last backup"}</span></div>
      </div>
      <section className="dashboard-panel data-actions">
        <div><h2>{locale === "zh-CN" ? "备份与迁移" : "Backup and migration"}</h2><ShieldCheck /></div>
        <p>{locale === "zh-CN" ? "备份包含进度、练习和非敏感偏好，不包含临时考试范围、Worker endpoint 或 AI 访问码。" : "Backups contain progress, attempts, and non-sensitive preferences—not exam scope, Worker endpoint, or AI access tokens."}</p>
        <div className="settings-actions">
          <button className="primary-action" type="button" onClick={() => void exportData()}><Download size={17} /> {locale === "zh-CN" ? "导出 JSON" : "Export JSON"}</button>
          <select value={mode} onChange={(event) => setMode(event.target.value as ImportMode)} aria-label={locale === "zh-CN" ? "导入模式" : "Import mode"}>
            <option value="merge">{locale === "zh-CN" ? "按更新时间合并" : "Merge by update time"}</option>
            <option value="replace">{locale === "zh-CN" ? "全部替换" : "Replace all"}</option>
          </select>
          <button type="button" onClick={() => fileRef.current?.click()}><FileUp size={17} /> {locale === "zh-CN" ? "导入备份" : "Import backup"}</button>
          <input ref={fileRef} type="file" accept="application/json,.json" hidden onChange={(event) => { const file = event.target.files?.[0]; if (file) void importData(file); }} />
        </div>
      </section>
      <section className="dashboard-panel danger-panel">
        <div><h2>{locale === "zh-CN" ? "清除学习数据" : "Clear learning data"}</h2></div>
        <p>{locale === "zh-CN" ? "删除当前浏览器中的进度、练习和偏好。内容知识库不会被删除。" : "Deletes progress, attempts, and preferences in this browser. Study content remains available."}</p>
        <button type="button" onClick={() => void clearData()}><Trash2 size={17} /> {locale === "zh-CN" ? "清除本地数据" : "Clear local data"}</button>
      </section>
      {status && <p className="settings-status" role="status">{status}</p>}
    </section>
  );
}
