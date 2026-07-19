import {
  monthlyPlateSourcePositionLabels,
  type MonthlyPlateSourceCoverage as MonthlyPlateSourceCoverageValue,
  type MonthlyPlateSourceMarker,
} from "@/lib/monthly-plate-source-marker-display";

type MonthlyPlateSourceMarkersProps = {
  markers: readonly MonthlyPlateSourceMarker[];
};

export function MonthlyPlateSourceMarkers({
  markers,
}: MonthlyPlateSourceMarkersProps) {
  if (markers.length === 0) {
    return null;
  }

  return (
    <details className="purposeCalendarSourceMarkers">
      <summary>月盤原典marker（検証中）</summary>
      <div className="purposeCalendarSourceMarkerBody">
        <div className="purposeCalendarSourceMarkerList">
          {markers.map((marker) => (
            <dl key={marker.markerId}>
              <div>
                <dt>原典表記</dt>
                <dd>{marker.rawLabel}</dd>
              </div>
              <div>
                <dt>紙面位置</dt>
                <dd>{monthlyPlateSourcePositionLabels[marker.sourcePosition]}</dd>
              </div>
              <div>
                <dt>凡例対応</dt>
                <dd>{marker.interpretation.label}</dd>
              </div>
              <div>
                <dt>確認状態</dt>
                <dd>写真確認済み</dd>
              </div>
              <div>
                <dt>確認範囲</dt>
                <dd>寅月 Pilot {marker.yearBranchGroup}</dd>
              </div>
              <div>
                <dt>資料</dt>
                <dd>改訂版 平成・萬年暦 p.24</dd>
              </div>
              <div>
                <dt>Source</dt>
                <dd>{marker.sourceId}</dd>
              </div>
            </dl>
          ))}
        </div>
        <p className="purposeCalendarSourceMarkerNotice">
          紙面位置は、現時点では8方位・24山として確定していません。
          <br />
          このmarkerは原典確認用の表示であり、候補、ランク、警告、吉凶判定には使用していません。
        </p>
      </div>
    </details>
  );
}

type MonthlyPlateSourceCoverageProps = {
  coverage: MonthlyPlateSourceCoverageValue;
};

export function MonthlyPlateSourceCoverage({
  coverage,
}: MonthlyPlateSourceCoverageProps) {
  const isPilotConfirmed = coverage.level2.status === "pilot_confirmed";
  const markerLabels = [
    ...new Set(coverage.level2.markers.map(({ rawLabel }) => rawLabel)),
  ].join("・");

  return (
    <section
      aria-label="月盤原典の照合状況"
      className="purposeCalendarSourceCoverage"
    >
      <strong className="purposeCalendarSourceCoverageTitle">
        月盤原典の照合状況
      </strong>
      <div className="purposeCalendarSourceCoverageRows">
        <div>
          <strong>基本盤：照合済み</strong>
          <small>中宮・九星配置・五黄殺・暗剣殺・月破</small>
        </div>
        <div>
          <strong>
            追加marker：{isPilotConfirmed ? "Pilot確認あり" : "この月は未照合"}
          </strong>
          <small>
            {isPilotConfirmed
              ? markerLabels
              : "細字方位神は寅月Pilotから順次確認中"}
          </small>
        </div>
      </div>
      {isPilotConfirmed ? (
        <MonthlyPlateSourceMarkers markers={coverage.level2.markers} />
      ) : null}
    </section>
  );
}
