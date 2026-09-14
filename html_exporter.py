# -*- coding: utf-8 -*-
"""
HTML5 & Vector PDF Exporter for College Timetables.
Generates an ultra-crisp, printable A4 landscape document with 1-click vector PDF generation.
"""

import os
import re
import html
from typing import Dict, Any, List

class HTMLExporter:
    @staticmethod
    def _clean_time_header(s: str) -> str:
        if not s:
            return ""
        s = re.sub(r'(\b\d{1,2})\.(\d{2})', r'\1:\2', s)
        s = re.sub(r'\bA\s+M\b', 'AM', s, flags=re.IGNORECASE)
        s = re.sub(r'\bP\s+M\b', 'PM', s, flags=re.IGNORECASE)
        s = re.sub(r'(\d{1,2}:\d{2})\s*(AM|PM)', r'\1 \2', s, flags=re.IGNORECASE)
        s = re.sub(r'\b0([1-9]:\d{2})', r'\1', s)
        times = re.findall(r'(\d{1,2}:\d{2}\s*(?:AM|PM)?)', s, flags=re.IGNORECASE)
        if len(times) == 2:
            t1, t2 = times[0].strip(), times[1].strip()
            m2 = re.search(r'[AP]M', t2, re.I)
            if not re.search(r'[AP]M', t1, re.I) and m2:
                t1 += ' ' + m2.group(0)
            return f"{t1}<br>-<br>{t2}"
        return html.escape(s).replace('\n', '<br>')

    @staticmethod
    def _clean_legend_time(s: str) -> str:
        if not s:
            return ""
        s = re.sub(r'(\b\d{1,2})\.(\d{2})', r'\1:\2', s)
        s = re.sub(r'\bA\s+M\b', 'AM', s, flags=re.IGNORECASE)
        s = re.sub(r'\bP\s+M\b', 'PM', s, flags=re.IGNORECASE)
        s = re.sub(r'(\d{1,2}:\d{2})\s*(AM|PM)', r'\1 \2', s, flags=re.IGNORECASE)
        s = re.sub(r'\b0([1-9]:\d{2})', r'\1', s)
        times = re.findall(r'(\d{1,2}:\d{2}\s*(?:AM|PM)?)', s, flags=re.IGNORECASE)
        if len(times) == 2:
            t1, t2 = times[0].strip(), times[1].strip()
            m2 = re.search(r'[AP]M', t2, re.I)
            if not re.search(r'[AP]M', t1, re.I) and m2:
                t1 += ' ' + m2.group(0)
            return f"{t1} - {t2}"
        return s.strip()

    @classmethod
    def export(cls, data: Dict[str, Any], grid: List[List[Dict[str, Any]]], output_path: str = "timetable.html") -> str:
        institution = html.escape(data.get("institution", "COLLEGE OF ENGINEERING AND TECHNOLOGY").upper())
        department = html.escape(data.get("department", "DEPARTMENT OF COMPUTER SCIENCE").upper())
        doc_title = html.escape(data.get("title", "TIME TABLE").upper())

        meta = data.get("meta", {})
        year_sem = html.escape(meta.get("year_sem_class_dept", "II/III/IT"))
        acad_yr = html.escape(meta.get("academic_year", "2026-2027 ODD SEM"))
        mentor = html.escape(meta.get("mentor", "Mrs.SUGANYA,AP/AI&DS"))
        wef = html.escape(meta.get("wef", "01.07.2026"))
        version = html.escape(meta.get("version", "01"))

        days = data.get("days", ["Mon", "Tue", "Wed", "Thu", "Fri"])
        num_days = len(days)
        periods_per_day = data.get("periods_per_day", 7)
        timings = data.get("timings", [])
        break_after = data.get("break_after_period", 2)
        lunch_after = data.get("lunch_after_period", 4)

        raw_brk = data.get('break_time', '10:40 AM - 11:00 AM')
        raw_lch = data.get('lunch_time', '12:40 PM - 1:30 PM')
        break_legend = html.escape(cls._clean_legend_time(raw_brk))
        lunch_legend = html.escape(cls._clean_legend_time(raw_lch))

        subjects = data.get("subjects", [])

        # Build timetable header
        th_cells = ['<th class="day-col-hdr">Day / Time</th>']
        for p in range(periods_per_day):
            if p == break_after:
                th_cells.append('<th class="v-col-hdr"></th>')
            if p == lunch_after:
                th_cells.append('<th class="v-col-hdr"></th>')
            raw_t = timings[p] if p < len(timings) else f"P{p+1}"
            t_html = cls._clean_time_header(raw_t)
            th_cells.append(f'<th class="period-col-hdr">{t_html}</th>')

        # Build timetable day rows
        timetable_rows = []
        for d_idx, day_name in enumerate(days):
            cells = [f'<td class="day-cell"><strong>{html.escape(day_name)}</strong></td>']
            p = 0
            while p < periods_per_day:
                if p == break_after and d_idx == 0:
                    v_letters = ''.join(f'<span>{c}</span>' for c in "BREAK")
                    cells.append(f'<td rowspan="{num_days}" class="v-col break-col"><div class="v-text">{v_letters}</div></td>')
                if p == lunch_after and d_idx == 0:
                    v_lunch = ''.join(f'<span>{c}</span>' for c in "LUNCH")
                    v_break = ''.join(f'<span>{c}</span>' for c in "BREAK")
                    cells.append(f'<td rowspan="{num_days}" class="v-col lunch-col"><div class="v-text">{v_lunch}<div class="v-spacer"></div>{v_break}</div></td>')

                cell_data = grid[d_idx][p] if d_idx < len(grid) and p < len(grid[d_idx]) else {}
                if cell_data.get("is_continuation", False):
                    p += 1
                    continue

                span = cell_data.get("span", 1)
                span_attr = f' colspan="{span}"' if span > 1 else ''
                disp = html.escape(cell_data.get("display", ""))
                is_lab = "(LAB)" in disp.upper()
                cls_slot = " lab-slot" if is_lab else ""
                disp_formatted = disp.replace('(LAB)', '<br><span class="lab-badge">LAB</span>').replace('\n', '<br>')
                cells.append(f'<td{span_attr} class="period-cell{cls_slot}">{disp_formatted}</td>')
                p += 1
            timetable_rows.append('<tr>' + ''.join(cells) + '</tr>')

        # Build faculty table rows
        sub_rows = []
        total_sessions = 0
        for s_idx, sub in enumerate(subjects):
            s_no = s_idx + 1
            code = html.escape(str(sub.get("code", "")))
            name = html.escape(str(sub.get("name", "")))
            staff = html.escape(str(sub.get("staff", "")))
            l_val = sub.get("l", 0)
            t_val = sub.get("t", 0)
            p_val = sub.get("p", 0)
            tot = sub.get("total", l_val + t_val + p_val)
            total_sessions += tot

            sub_rows.append(f'''<tr>
                <td class="tac">{s_no}</td>
                <td class="tac bold-code">{code}</td>
                <td class="tal">{name}</td>
                <td class="tal">{staff}</td>
                <td class="tac">{l_val}</td>
                <td class="tac">{t_val}</td>
                <td class="tac">{p_val}</td>
                <td class="tac bold-tot">{tot}</td>
            </tr>''')

        page_html = f'''<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes">
<link rel="icon" type="image/png" href="logo.png">
<script src="logo.js"></script>
<title>{institution} - {doc_title}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
  
  :root {{
    --border-color: #000000;
    --th-bg: #f8fafc;
    --meta-color: #0f172a;
    --highlight-bg: #f1f5f9;
  }}

  * {{
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }}

  body {{
    font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    background-color: #0f172a;
    color: #000000;
    min-height: 100vh;
    padding: 20px;
    display: flex;
    flex-direction: column;
    align-items: center;
  }}

  /* Action Bar (Screen only) */
  .action-bar {{
    position: sticky;
    top: 12px;
    z-index: 1000;
    width: 100%;
    max-width: 1200px;
    background: rgba(30, 41, 59, 0.95);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 14px;
    padding: 12px 20px;
    margin-bottom: 20px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.5);
    color: #ffffff;
  }}

  .action-info {{
    display: flex;
    align-items: center;
    gap: 12px;
  }}

  .action-title {{
    font-size: 15px;
    font-weight: 700;
    letter-spacing: 0.3px;
    color: #f8fafc;
  }}

  .badge-vector {{
    background: #0ea5e9;
    color: #ffffff;
    font-size: 11px;
    font-weight: 700;
    padding: 3px 8px;
    border-radius: 6px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }}

  .action-btns {{
    display: flex;
    align-items: center;
    gap: 10px;
  }}

  .btn {{
    display: inline-flex;
    align-items: center;
    gap: 8px;
    font-family: inherit;
    font-size: 13px;
    font-weight: 600;
    padding: 8px 16px;
    border-radius: 8px;
    cursor: pointer;
    border: none;
    transition: all 0.15s ease;
    text-decoration: none;
  }}

  .btn-print {{
    background: #10b981;
    color: #ffffff;
    box-shadow: 0 2px 8px rgba(16, 185, 129, 0.4);
  }}

  .btn-print:hover {{
    background: #059669;
    transform: translateY(-1px);
  }}

  .btn-zoom {{
    background: #334155;
    color: #cbd5e1;
  }}

  .btn-zoom:hover {{
    background: #475569;
    color: #ffffff;
  }}

  /* A4 Document Sheet */
  .sheet-wrapper {{
    width: 100%;
    max-width: 1360px;
    overflow-x: auto;
    display: flex;
    justify-content: center;
    padding-bottom: 30px;
  }}

  .sheet {{
    background: #ffffff;
    width: 1280px;
    min-width: 1280px;
    padding: 24px 32px 30px 32px;
    border-radius: 4px;
    box-shadow: 0 15px 35px rgba(0, 0, 0, 0.45);
    transform-origin: top center;
    transition: transform 0.2s ease;
  }}

  /* Institutional Header */
  .header {{
    text-align: center;
    margin-bottom: 12px;
  }}

  .institution-name {{
    font-size: 22px;
    font-weight: 800;
    letter-spacing: 0.5px;
    color: #000000;
    line-height: 1.25;
  }}

  .department-name {{
    font-size: 17px;
    font-weight: 700;
    letter-spacing: 0.3px;
    color: #1e293b;
    margin-top: 3px;
  }}

  .document-title {{
    font-size: 18px;
    font-weight: 800;
    letter-spacing: 1px;
    color: #000000;
    margin-top: 4px;
    text-decoration: underline;
    text-underline-offset: 3px;
  }}

  /* Metadata Section */
  .meta-grid {{
    display: flex;
    flex-direction: column;
    gap: 3px;
    margin-bottom: 12px;
    font-size: 13.5px;
    color: var(--meta-color);
  }}

  .meta-row {{
    display: flex;
    justify-content: space-between;
    font-weight: 700;
  }}

  .meta-left span, .meta-right span {{
    font-weight: 800;
  }}

  /* Timetable Table */
  table.timetable-grid {{
    width: 100%;
    border-collapse: collapse;
    border: 2px solid var(--border-color);
    table-layout: fixed;
    margin-bottom: 6px;
  }}

  table.timetable-grid th, table.timetable-grid td {{
    border: 1.5px solid var(--border-color);
    text-align: center;
    vertical-align: middle;
    padding: 6px 4px;
  }}

  table.timetable-grid th {{
    background-color: var(--th-bg);
    font-size: 12.5px;
    font-weight: 700;
    line-height: 1.25;
  }}

  .day-col-hdr {{
    width: 105px;
    font-size: 13.5px !important;
  }}

  .v-col-hdr {{
    width: 28px;
    background-color: var(--th-bg);
  }}

  .day-cell {{
    font-size: 14.5px;
    font-weight: 700;
    background-color: var(--th-bg);
    height: 52px;
  }}

  .period-cell {{
    font-size: 14.5px;
    font-weight: 700;
    line-height: 1.25;
    background: #ffffff;
  }}

  .lab-slot {{
    background: #f8fafc;
  }}

  .lab-badge {{
    display: inline-block;
    font-size: 10px;
    font-weight: 800;
    background: #e2e8f0;
    color: #334155;
    padding: 1px 5px;
    border-radius: 4px;
    margin-top: 2px;
  }}

  .v-col {{
    width: 28px;
    padding: 0 !important;
    background: #ffffff;
  }}

  .v-text {{
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    font-weight: 800;
    font-size: 12.5px;
    letter-spacing: 0.5px;
    gap: 6px;
  }}

  .v-spacer {{
    height: 14px;
  }}

  /* Legend row */
  .legend-row {{
    display: flex;
    justify-content: space-around;
    padding: 5px 20px;
    font-size: 13px;
    font-weight: 700;
    margin-bottom: 12px;
  }}

  /* Bottom Faculty Table */
  table.faculty-grid {{
    width: 100%;
    border-collapse: collapse;
    border: 2px solid var(--border-color);
  }}

  table.faculty-grid th, table.faculty-grid td {{
    border: 1.5px solid var(--border-color);
    padding: 5px 8px;
    font-size: 12px;
  }}

  table.faculty-grid th {{
    background-color: var(--th-bg);
    font-weight: 700;
    text-align: center;
    line-height: 1.25;
  }}

  .tac {{ text-align: center; }}
  .tal {{ text-align: left; }}
  .bold-code {{ font-weight: 700; font-family: monospace; font-size: 12.5px; }}
  .bold-tot {{ font-weight: 800; }}

  .summary-row td {{
    background-color: var(--highlight-bg);
    font-weight: 800;
    font-size: 13px;
    height: 32px;
  }}

  /* Print Stylesheet (Crisp Vector A4 Output) */
  @media print {{
    @page {{
      size: A4 landscape;
      margin: 8mm 10mm;
    }}
    body {{
      background: transparent !important;
      padding: 0 !important;
      margin: 0 !important;
    }}
    .action-bar {{
      display: none !important;
    }}
    .sheet-wrapper {{
      padding: 0 !important;
      overflow: visible !important;
      display: block !important;
    }}
    .sheet {{
      width: 100% !important;
      min-width: 100% !important;
      box-shadow: none !important;
      padding: 0 !important;
      border-radius: 0 !important;
      transform: none !important;
    }}
    table.timetable-grid th, table.timetable-grid td,
    table.faculty-grid th, table.faculty-grid td {{
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }}
  }}
</style>
</head>
<body>

<div class="action-bar no-print">
  <div class="action-info" style="display: flex; align-items: center; gap: 8px;">
    <img src="logo.png" alt="Logo" style="width: 26px; height: 26px; border-radius: 50%; background: #ffffff; padding: 1px; object-fit: contain;" onerror="this.onerror=null;if(window.FOLIO_LOGO_DATA_URL)this.src=window.FOLIO_LOGO_DATA_URL;">
    <span class="badge-vector">Vector Document</span>
    <span class="action-title">{institution} &bull; {doc_title}</span>
    <span style="font-size: 11px; color: #cbd5e1; margin-left: 8px; font-weight: 500;">&bull; Developed By Aathithya A (IT DEPT)</span>
  </div>
  <div class="action-btns">
    <button class="btn btn-zoom" onclick="zoomSheet(-0.1)">&#x2212; Zoom</button>
    <button class="btn btn-zoom" onclick="zoomSheet(0.1)">&#x2B; Zoom</button>
    <button class="btn btn-zoom" onclick="resetZoom()">Reset</button>
    <button class="btn btn-print" onclick="window.print()">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
      Print / Save as PDF
    </button>
  </div>
</div>

<div class="sheet-wrapper">
  <div class="sheet" id="docSheet">
    <!-- Institutional Header -->
    <div class="header">
      <div class="institution-name">{institution}</div>
      <div class="department-name">{department}</div>
      <div class="document-title">{doc_title}</div>
    </div>

    <!-- Metadata Row -->
    <div class="meta-grid">
      <div class="meta-row">
        <div class="meta-left">Year / Sem/Class/Dept: <span>{year_sem}</span></div>
        <div class="meta-right">Academic year: <span>{acad_yr}</span></div>
      </div>
      <div class="meta-row">
        <div class="meta-left">Name of the Mentor: <span>{mentor}</span></div>
        <div class="meta-right">W.E.F: <span>{wef}</span></div>
      </div>
      <div class="meta-row">
        <div></div>
        <div class="meta-right">Time Table Version: <span>{version}</span></div>
      </div>
    </div>

    <!-- Master Timetable Grid -->
    <table class="timetable-grid">
      <thead>
        <tr>
          {''.join(th_cells)}
        </tr>
      </thead>
      <tbody>
        {''.join(timetable_rows)}
      </tbody>
    </table>

    <!-- Break / Lunch Legend -->
    <div class="legend-row">
      <div>Break: &nbsp; {break_legend}</div>
      <div>Lunch Break: &nbsp; {lunch_legend}</div>
    </div>

    <!-- Faculty & Subject Allocation Table -->
    <table class="faculty-grid">
      <thead>
        <tr>
          <th rowspan="2" style="width: 45px;">S.<br>NO</th>
          <th rowspan="2" style="width: 110px;">SUBJECT<br>CODE</th>
          <th rowspan="2" style="width: 380px;">NAME OF THE SUBJECT / VALUE ADDED COURSE</th>
          <th rowspan="2">NAME &amp; DESIGNATION OF STAFF</th>
          <th colspan="3" style="width: 140px;">NO. OF SESSIONS/WEEK</th>
          <th rowspan="2" style="width: 75px;">TOTAL<br>HOURS</th>
        </tr>
        <tr>
          <th style="width: 45px;">L</th>
          <th style="width: 45px;">T</th>
          <th style="width: 45px;">P</th>
        </tr>
      </thead>
      <tbody>
        {''.join(sub_rows)}
        <tr class="summary-row">
          <td colspan="7" class="tac">TOTAL HOURS PER WEEK</td>
          <td class="tac">{total_sessions}</td>
        </tr>
      </tbody>
    </table>
  </div>
</div>

<script>
  let currentZoom = 1.0;
  function zoomSheet(delta) {{
    currentZoom = Math.min(Math.max(0.5, currentZoom + delta), 1.8);
    document.getElementById('docSheet').style.transform = 'scale(' + currentZoom + ')';
  }}
  function resetZoom() {{
    currentZoom = 1.0;
    document.getElementById('docSheet').style.transform = 'scale(1.0)';
  }}
</script>

</body>
</html>
'''
        with open(output_path, "w", encoding="utf-8") as f:
            f.write(page_html)

        return output_path
