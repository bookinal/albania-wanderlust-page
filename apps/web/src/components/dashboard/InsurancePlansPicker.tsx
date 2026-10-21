import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import Swal from "sweetalert2";
import type {
  CreateInsurancePlanDto,
  InsuranceCoverageKey,
  InsurancePlan,
  InsuranceTier,
} from "@/types/insurance.types";
import {
  createInsurancePlan,
  deleteInsurancePlan,
  getMyInsurancePlans,
  updateInsurancePlan,
} from "@/services/api/insuranceService";
import {
  DEFAULT_INSURANCE_PLAN_NAMES,
  INSURANCE_COVERAGE_KEYS,
  INSURANCE_TIERS,
  INSURANCE_TIER_DEFAULTS,
  formatInsurancePrice,
  getInsurancePlanLabel,
  validateInsurancePlan,
} from "@/lib/insurancePlans";

interface InsurancePlansPickerProps {
  /** Plans attached to the car being added / edited */
  selectedIds: number[];
  onChange: (ids: number[]) => void;
  inputStyle: React.CSSProperties;
  selectStyle: React.CSSProperties;
  labelColor: string;
  mutedColor: string;
  optionBg: string;
  borderColor: string;
  rowBg: string;
  accentColor?: string;
  disabled?: boolean;
  showTitle?: boolean;
}

type PlanDraft = {
  id?: number;
  tier: InsuranceTier;
  name: string;
  pricePerDay: string;
  coveragePercent: string;
  coverage: InsuranceCoverageKey[];
};

const draftFromTier = (tier: InsuranceTier): PlanDraft => {
  const d = INSURANCE_TIER_DEFAULTS[tier];
  return {
    tier,
    name: "",
    pricePerDay: "",
    coveragePercent: d.coveragePercent === null ? "" : String(d.coveragePercent),
    coverage: [...d.coverage],
  };
};

const draftFromPlan = (plan: InsurancePlan): PlanDraft => ({
  id: plan.id,
  tier: plan.tier,
  name: plan.name === DEFAULT_INSURANCE_PLAN_NAMES[plan.tier] ? "" : plan.name,
  pricePerDay: String(plan.pricePerDay),
  coveragePercent: plan.coveragePercent === null ? "" : String(plan.coveragePercent),
  coverage: [...plan.coverage],
});

const draftToDto = (draft: PlanDraft): CreateInsurancePlanDto => ({
  tier: draft.tier,
  name: draft.name.trim() || DEFAULT_INSURANCE_PLAN_NAMES[draft.tier],
  pricePerDay: draft.pricePerDay === "" ? 0 : Number(draft.pricePerDay),
  coveragePercent:
    draft.tier === "third_party" || draft.coveragePercent === ""
      ? null
      : Number(draft.coveragePercent),
  coverage: INSURANCE_COVERAGE_KEYS.filter((k) => draft.coverage.includes(k)),
});

/** Provider's insurance plans: create / edit them and choose which ones a car offers. */
export const InsurancePlansPicker: React.FC<InsurancePlansPickerProps> = ({
  selectedIds,
  onChange,
  inputStyle,
  selectStyle,
  labelColor,
  mutedColor,
  optionBg,
  borderColor,
  rowBg,
  accentColor = "#E8192C",
  disabled,
  showTitle = true,
}) => {
  const { t } = useTranslation();
  const [plans, setPlans] = useState<InsurancePlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [busy, setBusy] = useState(false);
  const [draft, setDraft] = useState<PlanDraft | null>(null);
  // Quick setup of the standard plans (first time only)
  const [quickPrices, setQuickPrices] = useState<Record<InsuranceTier, string>>({
    third_party: "0",
    mini_kasko_70: "",
    kasko_80: "",
    full: "",
  });
  const [quickIncluded, setQuickIncluded] = useState<Record<InsuranceTier, boolean>>({
    third_party: true,
    mini_kasko_70: true,
    kasko_80: true,
    full: true,
  });

  const loadPlans = async () => {
    setLoading(true);
    setLoadError(false);
    try {
      setPlans(await getMyInsurancePlans());
    } catch (error) {
      console.error("Error loading insurance plans:", error);
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPlans();
  }, []);

  const isDisabled = disabled || busy;

  const labelStyle: React.CSSProperties = { fontSize: 13, fontWeight: 500, color: labelColor, marginBottom: 6 };
  const helpStyle: React.CSSProperties = { fontSize: 12, color: mutedColor, marginTop: 4 };
  const smallBtn: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    gap: 4,
    padding: "6px 10px",
    borderRadius: 6,
    border: `1px solid ${borderColor}`,
    background: "transparent",
    color: labelColor,
    fontSize: 12,
    fontWeight: 500,
    cursor: isDisabled ? "default" : "pointer",
  };
  const primaryBtn: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    padding: "8px 14px",
    borderRadius: 8,
    border: "none",
    background: accentColor,
    color: "#fff",
    fontSize: 13,
    fontWeight: 600,
    cursor: isDisabled ? "default" : "pointer",
    opacity: isDisabled ? 0.7 : 1,
  };

  const showError = (key: string) =>
    Swal.fire({ icon: "warning", title: t("insurance.title"), text: t(key) });

  const toggleSelected = (id: number) =>
    onChange(selectedIds.includes(id) ? selectedIds.filter((x) => x !== id) : [...selectedIds, id]);

  const handleQuickCreate = async () => {
    const tiers = INSURANCE_TIERS.filter((tier) => quickIncluded[tier]);
    if (tiers.length === 0) return showError("insurance.validation.selectOne");
    const dtos = tiers.map((tier) => ({
      ...draftToDto(draftFromTier(tier)),
      pricePerDay: quickPrices[tier] === "" ? NaN : Number(quickPrices[tier]),
    }));
    if (dtos.some((dto) => !Number.isFinite(dto.pricePerDay))) {
      return showError("insurance.validation.priceRequired");
    }
    const invalid = dtos.map(validateInsurancePlan).find(Boolean);
    if (invalid) return showError(invalid);

    setBusy(true);
    try {
      const created: InsurancePlan[] = [];
      for (const dto of dtos) created.push(await createInsurancePlan(dto));
      setPlans((prev) => [...prev, ...created]);
      onChange([...selectedIds, ...created.map((p) => p.id)]);
    } catch (error) {
      console.error("Error creating insurance plans:", error);
      showError("insurance.validation.saveFailed");
    } finally {
      setBusy(false);
    }
  };

  const handleSaveDraft = async () => {
    if (!draft) return;
    if (draft.pricePerDay === "") return showError("insurance.validation.priceRequired");
    const dto = draftToDto(draft);
    const invalid = validateInsurancePlan(dto);
    if (invalid) return showError(invalid);

    setBusy(true);
    try {
      if (draft.id) {
        const updated = await updateInsurancePlan(draft.id, dto);
        setPlans((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
      } else {
        const created = await createInsurancePlan(dto);
        setPlans((prev) => [...prev, created]);
        onChange([...selectedIds, created.id]);
      }
      setDraft(null);
    } catch (error) {
      console.error("Error saving insurance plan:", error);
      showError("insurance.validation.saveFailed");
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async (plan: InsurancePlan) => {
    const result = await Swal.fire({
      icon: "warning",
      title: getInsurancePlanLabel(plan, t),
      text: t("insurance.deleteConfirm"),
      showCancelButton: true,
      confirmButtonText: t("insurance.delete"),
      cancelButtonText: t("common.cancel"),
      confirmButtonColor: accentColor,
    });
    if (!result.isConfirmed) return;
    setBusy(true);
    try {
      await deleteInsurancePlan(plan.id);
      setPlans((prev) => prev.filter((p) => p.id !== plan.id));
      onChange(selectedIds.filter((id) => id !== plan.id));
    } catch (error) {
      console.error("Error deleting insurance plan:", error);
      showError("insurance.validation.saveFailed");
    } finally {
      setBusy(false);
    }
  };

  const coverageSummary = (coverage: InsuranceCoverageKey[]) =>
    INSURANCE_COVERAGE_KEYS.filter((k) => coverage.includes(k))
      .map((k) => t(`insurance.coverage.${k}`))
      .join(" · ");

  const renderDraftForm = (current: PlanDraft) => (
    <div style={{ border: `1px solid ${borderColor}`, borderRadius: 8, padding: 16, background: rowBg }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12 }}>
        <div>
          <p style={labelStyle}>{t("insurance.tier")}</p>
          <select
            value={current.tier}
            disabled={isDisabled || Boolean(current.id)}
            onChange={(e) => setDraft({ ...draftFromTier(e.target.value as InsuranceTier), pricePerDay: current.pricePerDay })}
            style={selectStyle}
          >
            {INSURANCE_TIERS.map((tier) => (
              <option key={tier} value={tier} style={{ background: optionBg }}>
                {t(`insurance.tiers.${tier}`)}
              </option>
            ))}
          </select>
        </div>
        <div>
          <p style={labelStyle}>{t("insurance.name")}</p>
          <input
            value={current.name}
            placeholder={t(`insurance.tiers.${current.tier}`)}
            maxLength={80}
            disabled={isDisabled}
            onChange={(e) => setDraft({ ...current, name: e.target.value })}
            style={inputStyle}
          />
        </div>
        <div>
          <p style={labelStyle}>
            {t("insurance.pricePerDayLabel")} <span style={{ color: accentColor }}>*</span>
          </p>
          <input
            type="number"
            min="0"
            step="0.5"
            value={current.pricePerDay}
            placeholder={String(INSURANCE_TIER_DEFAULTS[current.tier].suggestedPrice)}
            disabled={isDisabled}
            onChange={(e) => setDraft({ ...current, pricePerDay: e.target.value })}
            style={inputStyle}
          />
          <p style={helpStyle}>{t("insurance.freeHelp")}</p>
        </div>
        {current.tier !== "third_party" && (
          <div>
            <p style={labelStyle}>{t("insurance.coveragePercent")}</p>
            <input
              type="number"
              min="1"
              max="100"
              value={current.coveragePercent}
              disabled={isDisabled}
              onChange={(e) => setDraft({ ...current, coveragePercent: e.target.value })}
              style={inputStyle}
            />
          </div>
        )}
      </div>

      <p style={{ ...labelStyle, marginTop: 14 }}>{t("insurance.risksCovered")}</p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: "6px 12px" }}>
        {INSURANCE_COVERAGE_KEYS.map((key) => (
          <label key={key} style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 13, color: labelColor, cursor: "pointer" }}>
            <input
              type="checkbox"
              checked={current.coverage.includes(key)}
              disabled={isDisabled}
              onChange={(e) =>
                setDraft({
                  ...current,
                  coverage: e.target.checked
                    ? [...current.coverage, key]
                    : current.coverage.filter((k) => k !== key),
                })
              }
              style={{ width: 15, height: 15, accentColor }}
            />
            {t(`insurance.coverage.${key}`)}
          </label>
        ))}
      </div>

      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 16 }}>
        <button type="button" onClick={() => setDraft(null)} disabled={isDisabled} style={smallBtn}>
          {t("common.cancel")}
        </button>
        <button type="button" onClick={handleSaveDraft} disabled={isDisabled} style={primaryBtn}>
          {busy && <Loader2 size={14} className="animate-spin" />}
          {t("insurance.savePlan")}
        </button>
      </div>
    </div>
  );

  return (
    <div>
      {showTitle && (
        <p style={{ fontSize: 15, fontWeight: 600, color: labelColor, marginBottom: 4 }}>
          {t("insurance.title")} <span style={{ color: accentColor }}>*</span>
        </p>
      )}
      <p style={{ fontSize: 12, color: mutedColor, marginBottom: 12 }}>{t("insurance.providerHelp")}</p>

      {loading ? (
        <div style={{ display: "flex", alignItems: "center", gap: 8, color: mutedColor, fontSize: 13 }}>
          <Loader2 size={16} className="animate-spin" /> {t("insurance.loading")}
        </div>
      ) : loadError ? (
        <div style={{ fontSize: 13, color: mutedColor }}>
          {t("insurance.loadError")}{" "}
          <button type="button" onClick={loadPlans} style={{ ...smallBtn, marginLeft: 6 }}>
            {t("insurance.retry")}
          </button>
        </div>
      ) : plans.length === 0 ? (
        /* Quick setup of the standard plans */
        <div style={{ border: `1px solid ${borderColor}`, borderRadius: 8, overflow: "hidden" }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: labelColor, padding: "12px 14px 4px" }}>
            {t("insurance.quickSetupTitle")}
          </p>
          <p style={{ fontSize: 12, color: mutedColor, padding: "0 14px 10px" }}>{t("insurance.quickSetupHelp")}</p>
          {INSURANCE_TIERS.map((tier) => (
            <div
              key={tier}
              style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", borderTop: `1px solid ${borderColor}`, flexWrap: "wrap" }}
            >
              <label style={{ display: "flex", alignItems: "flex-start", gap: 10, flex: "1 1 260px", cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={quickIncluded[tier]}
                  disabled={isDisabled}
                  onChange={(e) => setQuickIncluded((prev) => ({ ...prev, [tier]: e.target.checked }))}
                  style={{ width: 16, height: 16, marginTop: 2, accentColor }}
                />
                <span>
                  <span style={{ display: "block", fontSize: 14, fontWeight: 600, color: labelColor }}>
                    {t(`insurance.tiers.${tier}`)}
                  </span>
                  <span style={{ display: "block", fontSize: 12, color: mutedColor }}>
                    {coverageSummary(INSURANCE_TIER_DEFAULTS[tier].coverage)}
                  </span>
                </span>
              </label>
              <div style={{ display: "flex", alignItems: "center", gap: 6, width: 150 }}>
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  value={quickPrices[tier]}
                  placeholder={String(INSURANCE_TIER_DEFAULTS[tier].suggestedPrice)}
                  disabled={isDisabled || !quickIncluded[tier]}
                  onChange={(e) => setQuickPrices((prev) => ({ ...prev, [tier]: e.target.value }))}
                  style={{ ...inputStyle, width: 90 }}
                  aria-label={`${t(`insurance.tiers.${tier}`)} – ${t("insurance.pricePerDayLabel")}`}
                />
                <span style={{ fontSize: 12, color: mutedColor }}>{t("insurance.perDayShort")}</span>
              </div>
            </div>
          ))}
          <div style={{ display: "flex", justifyContent: "flex-end", padding: "10px 14px", borderTop: `1px solid ${borderColor}` }}>
            <button type="button" onClick={handleQuickCreate} disabled={isDisabled} style={primaryBtn}>
              {busy ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
              {t("insurance.createPlans")}
            </button>
          </div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {plans.map((plan) =>
            draft?.id === plan.id ? (
              <React.Fragment key={plan.id}>{renderDraftForm(draft)}</React.Fragment>
            ) : (
              <div
                key={plan.id}
                style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", border: `1px solid ${borderColor}`, borderRadius: 8, background: selectedIds.includes(plan.id) ? rowBg : "transparent", flexWrap: "wrap" }}
              >
                <label style={{ display: "flex", alignItems: "flex-start", gap: 10, flex: "1 1 260px", cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(plan.id)}
                    disabled={isDisabled}
                    onChange={() => toggleSelected(plan.id)}
                    style={{ width: 16, height: 16, marginTop: 2, accentColor }}
                  />
                  <span>
                    <span style={{ display: "block", fontSize: 14, fontWeight: 600, color: labelColor }}>
                      {getInsurancePlanLabel(plan, t)}
                      <span style={{ fontWeight: 500, color: accentColor, marginLeft: 8 }}>
                        {formatInsurancePrice(plan.pricePerDay, t)}
                      </span>
                    </span>
                    <span style={{ display: "block", fontSize: 12, color: mutedColor }}>
                      {coverageSummary(plan.coverage)}
                    </span>
                  </span>
                </label>
                <div style={{ display: "flex", gap: 6 }}>
                  <button type="button" onClick={() => setDraft(draftFromPlan(plan))} disabled={isDisabled} style={smallBtn} aria-label={t("insurance.edit")}>
                    <Pencil size={13} /> {t("insurance.edit")}
                  </button>
                  <button type="button" onClick={() => handleDelete(plan)} disabled={isDisabled} style={smallBtn} aria-label={t("insurance.delete")}>
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ),
          )}

          {draft && !draft.id ? (
            renderDraftForm(draft)
          ) : (
            <div>
              <button type="button" onClick={() => setDraft(draftFromTier("full"))} disabled={isDisabled || Boolean(draft)} style={smallBtn}>
                <Plus size={13} /> {t("insurance.newPlan")}
              </button>
            </div>
          )}
          <p style={helpStyle}>{t("insurance.selectHelp")}</p>
        </div>
      )}
    </div>
  );
};
