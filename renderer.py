"""
High-Resolution Document Image Renderer for College Timetables.
Uses Pillow with 2x Super-Sampling Anti-Aliasing (SSAA) and Lanczos filtering
to render crisp, institutional A4 documents with zero jagged lines.
"""

import os
import re
from typing import Dict, Any, List, Tuple
from PIL import Image, ImageDraw, ImageFont


class TimetableRenderer:
    def __init__(self, output_path: str = "timetable.png", ssaa_scale: int = 2):
        self.output_path = output_path
        self.ssaa_scale = max(1, ssaa_scale)
        self.base_width = 2400
        self.base_height = 3200
        
        # Working dimensions at SSAA resolution
        self.width = self.base_width * self.ssaa_scale
        self.height = self.base_height * self.ssaa_scale
        self.scale = self.ssaa_scale

        self.bg_color = (255, 255, 255)
        self.line_color = (0, 0, 0)
        self.text_color = (15, 23, 42) # Deep crisp slate / black
        self.header_bg = (248, 250, 252) # Subtle modern fill
        self.summary_bg = (241, 245, 249) # Summary row fill
        self.lab_bg = (250, 250, 252)
        
        self.line_width = 2 * self.scale
        self.outer_line_width = 3 * self.scale

        # Fonts - load local bundled TrueType fonts first
        base_dir = os.path.dirname(os.path.abspath(__file__))
        local_font = os.path.join(base_dir, "arial.ttf")
        local_bold = os.path.join(base_dir, "arialbd.ttf")

        self.font_bold_path = local_bold if os.path.exists(local_bold) else ("C:/Windows/Fonts/arialbd.ttf" if os.path.exists("C:/Windows/Fonts/arialbd.ttf") else "")
        self.font_path = local_font if os.path.exists(local_font) else ("C:/Windows/Fonts/arial.ttf" if os.path.exists("C:/Windows/Fonts/arial.ttf") else "")
        
        self.font_title = self._load_font(self.font_bold_path, 56 * self.scale)
        self.font_dept = self._load_font(self.font_bold_path, 46 * self.scale)
        self.font_doc = self._load_font(self.font_bold_path, 48 * self.scale)
        self.font_meta = self._load_font(self.font_bold_path, 34 * self.scale)
        self.font_meta_reg = self._load_font(self.font_path, 34 * self.scale)
        self.font_th = self._load_font(self.font_bold_path, 32 * self.scale)
        self.font_cell = self._load_font(self.font_bold_path, 44 * self.scale)
        self.font_cell_sm = self._load_font(self.font_bold_path, 34 * self.scale)
        self.font_table_data = self._load_font(self.font_bold_path, 32 * self.scale)
        self.font_table_reg = self._load_font(self.font_path, 30 * self.scale)
        self.font_vtext = self._load_font(self.font_bold_path, 34 * self.scale)
        self.font_legend = self._load_font(self.font_bold_path, 34 * self.scale)

    def _load_font(self, path: str, size: int):
        try:
            if os.path.exists(path):
                return ImageFont.truetype(path, size)
        except Exception:
            pass
        return ImageFont.load_default()

    @staticmethod
    def _clean_timing_string(s: str) -> str:
        """Sanitizes raw OCR / user time strings into clean, professional 2-line timetable headers."""
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
            return f"{t1} -\n{t2}"
        return s.strip()

    @staticmethod
    def _clean_legend_timing(s: str) -> str:
        """Sanitizes legend time strings into clean single-line 'HH:MM AM - HH:MM PM'."""
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

    def _draw_centered_text(self, draw: ImageDraw.ImageDraw, text: str, x: int, y: int, font, fill=None):
        fill = fill or self.text_color
        bbox = draw.textbbox((0, 0), text, font=font)
        tw = bbox[2] - bbox[0]
        draw.text((x - tw // 2, y), text, font=font, fill=fill)

    def _draw_multiline_centered(self, draw: ImageDraw.ImageDraw, text: str, rect: Tuple[int, int, int, int], font, line_spacing=4):
        x1, y1, x2, y2 = rect
        spacing = line_spacing * self.scale
        lines = text.split("\n")
        line_heights = []
        line_widths = []
        for line in lines:
            bbox = draw.textbbox((0, 0), line, font=font)
            line_widths.append(bbox[2] - bbox[0])
            line_heights.append(bbox[3] - bbox[1])

        total_h = sum(line_heights) + (len(lines) - 1) * spacing
        cur_y = y1 + (y2 - y1 - total_h) // 2

        for i, line in enumerate(lines):
            cur_x = x1 + (x2 - x1 - line_widths[i]) // 2
            draw.text((cur_x, cur_y), line, font=font, fill=self.text_color)
            cur_y += line_heights[i] + spacing

    def _draw_multiline_left(self, draw: ImageDraw.ImageDraw, text: str, rect: Tuple[int, int, int, int], font, pad_x=12, line_spacing=4):
        x1, y1, x2, y2 = rect
        spacing = line_spacing * self.scale
        px = pad_x * self.scale
        lines = text.split("\n")
        line_heights = []
        for line in lines:
            bbox = draw.textbbox((0, 0), line, font=font)
            line_heights.append(bbox[3] - bbox[1])

        total_h = sum(line_heights) + (len(lines) - 1) * spacing
        cur_y = y1 + (y2 - y1 - total_h) // 2

        for i, line in enumerate(lines):
            draw.text((x1 + px, cur_y), line, font=font, fill=self.text_color)
            cur_y += line_heights[i] + spacing

    def _wrap_text(self, draw: ImageDraw.ImageDraw, text: str, font, max_width: int) -> str:
        words = text.split()
        if not words:
            return ""
        lines = []
        current_line = []
        for word in words:
            test_line = " ".join(current_line + [word])
            bbox = draw.textbbox((0, 0), test_line, font=font)
            if bbox[2] - bbox[0] <= max_width:
                current_line.append(word)
            else:
                if current_line:
                    lines.append(" ".join(current_line))
                    current_line = [word]
                else:
                    lines.append(word)
        if current_line:
            lines.append(" ".join(current_line))
        return "\n".join(lines)

    def render(self, data: Dict[str, Any], grid: List[List[Dict[str, Any]]]) -> str:
        img = Image.new("RGB", (self.width, self.height), self.bg_color)
        draw = ImageDraw.Draw(img)

        sc = self.scale
        margin_x = 90 * sc
        content_w = self.width - 2 * margin_x
        cur_y = 75 * sc

        # 1. Centered Header
        institution = data.get("institution", "COLLEGE OF ENGINEERING AND TECHNOLOGY").upper()
        department = data.get("department", "DEPARTMENT OF COMPUTER SCIENCE").upper()
        doc_title = data.get("title", "TIME TABLE").upper()

        self._draw_centered_text(draw, institution, self.width // 2, cur_y, self.font_title)
        cur_y += 50 * sc
        self._draw_centered_text(draw, department, self.width // 2, cur_y, self.font_dept)
        cur_y += 48 * sc
        self._draw_centered_text(draw, doc_title, self.width // 2, cur_y, self.font_doc)
        cur_y += 60 * sc

        # 2. Metadata Block
        meta = data.get("meta", {})
        meta_y1 = cur_y
        meta_left1 = f"Year / Sem/Class/Dept: {meta.get('year_sem_class_dept', 'II/III/IT')}"
        meta_right1 = f"Academic year: {meta.get('academic_year', '2026-2027 ODD SEM')}"
        
        draw.text((margin_x, meta_y1), meta_left1, font=self.font_meta, fill=self.text_color)
        r1_bbox = draw.textbbox((0, 0), meta_right1, font=self.font_meta)
        draw.text((margin_x + content_w - (r1_bbox[2] - r1_bbox[0]), meta_y1), meta_right1, font=self.font_meta, fill=self.text_color)

        meta_y2 = meta_y1 + 42 * sc
        mentor = meta.get('mentor', 'Mrs.SUGANYA,AP/AI&DS')
        meta_left2 = f"Name of the Mentor: {mentor}"
        wef = meta.get('wef', '01.07.2026')
        meta_right2 = f"W.E.F:{wef}"

        draw.text((margin_x, meta_y2), meta_left2, font=self.font_meta, fill=self.text_color)
        r2_bbox = draw.textbbox((0, 0), meta_right2, font=self.font_meta)
        draw.text((margin_x + content_w - (r2_bbox[2] - r2_bbox[0]), meta_y2), meta_right2, font=self.font_meta, fill=self.text_color)

        meta_y3 = meta_y2 + 42 * sc
        version = meta.get('version', '01')
        meta_right3 = f"Time Table Version:     {version}"
        r3_bbox = draw.textbbox((0, 0), meta_right3, font=self.font_meta)
        draw.text((margin_x + content_w - (r3_bbox[2] - r3_bbox[0]), meta_y3), meta_right3, font=self.font_meta, fill=self.text_color)

        cur_y = meta_y3 + 55 * sc

        # 3. Top Timetable Grid
        days = data.get("days", ["Mon", "Tue", "Wed", "Thu", "Fri"])
        num_days = len(days)
        periods_per_day = data.get("periods_per_day", 7)
        timings = data.get("timings", [
            "9:00 AM -\n9:50 AM", "9:50 AM -\n10:40 AM", "11:00 AM -\n11:50 AM",
            "11:50 AM -\n12:40 PM", "1:30 PM -\n2:20 PM", "2:20 PM -\n3:10 PM",
            "3:10 PM -\n4:00 PM"
        ])
        break_after = data.get("break_after_period", 2)
        lunch_after = data.get("lunch_after_period", 4)

        # Column widths calculation
        day_col_w = 230 * sc
        break_col_w = 48 * sc
        lunch_col_w = 66 * sc
        avail_for_periods = content_w - day_col_w - break_col_w - lunch_col_w
        p_w = avail_for_periods / periods_per_day

        cols = [{"type": "day", "title": "Day / Time", "width": day_col_w}]
        for p in range(periods_per_day):
            if p == break_after:
                cols.append({"type": "break", "title": "", "width": break_col_w})
            if p == lunch_after:
                cols.append({"type": "lunch", "title": "", "width": lunch_col_w})
            t_raw = timings[p] if p < len(timings) else f"P{p+1}"
            t_str = self._clean_timing_string(t_raw)
            cols.append({"type": "period", "period_idx": p, "title": t_str, "width": int(p_w)})

        # Adjust last col width for pixel exactness
        total_calc_w = sum(c["width"] for c in cols)
        diff = content_w - total_calc_w
        cols[-1]["width"] += diff

        col_x = [margin_x]
        for c in cols:
            col_x.append(col_x[-1] + c["width"])

        grid_top = cur_y
        header_row_h = 115 * sc
        day_row_h = 104 * sc
        grid_bottom = grid_top + header_row_h + num_days * day_row_h

        # Row y coordinates
        row_y = [grid_top, grid_top + header_row_h]
        for d in range(num_days):
            row_y.append(row_y[-1] + day_row_h)

        # Header background fill
        draw.rectangle([col_x[0], row_y[0], col_x[-1], row_y[1]], fill=self.header_bg)

        # Day column background fills
        for d_idx in range(num_days):
            r_idx = d_idx + 1
            draw.rectangle([col_x[0], row_y[r_idx], col_x[1], row_y[r_idx + 1]], fill=self.header_bg)

        # Outer border for Top Grid
        draw.rectangle([col_x[0], grid_top, col_x[-1], grid_bottom], outline=self.line_color, width=self.outer_line_width)

        # Draw Header Row Cells
        for i, c in enumerate(cols):
            x1, x2 = col_x[i], col_x[i+1]
            y1, y2 = row_y[0], row_y[1]
            
            draw.line([x1, y2, x2, y2], fill=self.line_color, width=self.line_width)
            if i < len(cols) - 1:
                draw.line([x2, y1, x2, y2], fill=self.line_color, width=self.line_width)

            if c["title"]:
                self._draw_multiline_centered(draw, c["title"], (x1, y1, x2, y2), self.font_th)

        break_col_idx = -1
        lunch_col_idx = -1
        for idx, c in enumerate(cols):
            if c["type"] == "break":
                break_col_idx = idx
            elif c["type"] == "lunch":
                lunch_col_idx = idx

        # Draw Days and Timetable Periods
        for d_idx, day_name in enumerate(days):
            r_idx = d_idx + 1
            y1, y2 = row_y[r_idx], row_y[r_idx + 1]

            # Horizontal line below row - segment across columns skipping break and lunch
            if r_idx <= num_days:
                if break_col_idx != -1:
                    draw.line([col_x[0], y2, col_x[break_col_idx], y2], fill=self.line_color, width=self.line_width)
                if break_col_idx != -1 and lunch_col_idx != -1:
                    draw.line([col_x[break_col_idx + 1], y2, col_x[lunch_col_idx], y2], fill=self.line_color, width=self.line_width)
                if lunch_col_idx != -1:
                    draw.line([col_x[lunch_col_idx + 1], y2, col_x[-1], y2], fill=self.line_color, width=self.line_width)
                elif break_col_idx == -1 and lunch_col_idx == -1:
                    draw.line([col_x[0], y2, col_x[-1], y2], fill=self.line_color, width=self.line_width)

            # Col 0: Day Name
            day_x1, day_x2 = col_x[0], col_x[1]
            draw.line([day_x2, y1, day_x2, y2], fill=self.line_color, width=self.line_width)
            self._draw_multiline_centered(draw, day_name, (day_x1, y1, day_x2, y2), self.font_cell)

            # Periods
            for col_idx, c in enumerate(cols):
                if c["type"] != "period":
                    continue
                p_idx = c["period_idx"]
                cell_data = grid[d_idx][p_idx]
                
                if cell_data.get("is_continuation", False):
                    continue

                span = cell_data.get("span", 1)
                x1 = col_x[col_idx]
                end_col_idx = col_idx
                cur_span_count = 1
                for k in range(col_idx + 1, len(cols)):
                    if cur_span_count >= span:
                        break
                    if cols[k]["type"] == "period":
                        cur_span_count += 1
                        end_col_idx = k
                    else:
                        break

                x2 = col_x[end_col_idx + 1]

                display_text = cell_data.get("display", "")
                cell_w = (x2 - x1) - 16 * sc
                text_to_wrap = display_text.replace("(LAB)", " (LAB)").replace("(Lab)", " (Lab)").strip()
                font_to_use = self.font_cell
                wrapped = self._wrap_text(draw, text_to_wrap, font_to_use, cell_w)
                lines = wrapped.split("\n")
                if any(draw.textbbox((0, 0), l, font=font_to_use)[2] - draw.textbbox((0, 0), l, font=font_to_use)[0] > cell_w for l in lines) or len(lines) > 2:
                    font_to_use = self.font_cell_sm
                    wrapped = self._wrap_text(draw, text_to_wrap, font_to_use, cell_w)
                self._draw_multiline_centered(draw, wrapped, (x1, y1, x2, y2), font_to_use, line_spacing=4)

                # Vertical separator on right of merged block
                if end_col_idx < len(cols) - 1:
                    draw.line([x2, y1, x2, y2], fill=self.line_color, width=self.line_width)

        # Draw Vertical Columns: BREAK and LUNCH BREAK
        for col_idx, c in enumerate(cols):
            if c["type"] in ("break", "lunch"):
                x1, x2 = col_x[col_idx], col_x[col_idx + 1]
                y_start = row_y[1]
                y_end = row_y[-1]

                draw.line([x1, y_start, x1, y_end], fill=self.line_color, width=self.line_width)
                draw.line([x2, y_start, x2, y_end], fill=self.line_color, width=self.line_width)

                if c["type"] == "break":
                    letters = ["B", "R", "E", "A", "K"]
                    spacing = (y_end - y_start) // (len(letters) + 1)
                    for l_idx, letter in enumerate(letters):
                        ly = y_start + spacing * (l_idx + 1)
                        self._draw_centered_text(draw, letter, (x1 + x2) // 2, ly, self.font_vtext)
                elif c["type"] == "lunch":
                    letters = ["L", "U", "N", "C", "H", "B", "R", "E", "A", "K"]
                    spacing = (y_end - y_start) // (len(letters) + 1)
                    for l_idx, letter in enumerate(letters):
                        ly = y_start + spacing * (l_idx + 1)
                        self._draw_centered_text(draw, letter, (x1 + x2) // 2, ly, self.font_vtext)

        cur_y = grid_bottom + 16 * sc

        # 4. Break Notes Legend
        raw_brk = data.get('break_time', '10:40 AM - 11:00 AM')
        raw_lch = data.get('lunch_time', '12:40 PM - 1:30 PM')
        break_note = f"Break:    {self._clean_legend_timing(raw_brk)}"
        lunch_note = f"Lunch Break: {self._clean_legend_timing(raw_lch)}"
        draw.text((margin_x + 90 * sc, cur_y), break_note, font=self.font_legend, fill=self.text_color)
        l_bbox = draw.textbbox((0, 0), lunch_note, font=self.font_legend)
        draw.text((margin_x + content_w - (l_bbox[2] - l_bbox[0]) - 90 * sc, cur_y), lunch_note, font=self.font_legend, fill=self.text_color)

        cur_y += 55 * sc

        # 5. Faculty Allocation Table (Bottom Table)
        subjects = data.get("subjects", [])
        
        b_cols = [
            {"title": "S.\nNO", "width": 100 * sc},
            {"title": "SUBJECT\nCODE", "width": 240 * sc},
            {"title": "NAME OF THE\nSUBJECT/VALUE ADDED\nCOURSE", "width": 690 * sc},
            {"title": "NAME & DESIGNATION OF STAFF", "width": 710 * sc},
            {"title": "L", "width": 80 * sc},
            {"title": "T", "width": 80 * sc},
            {"title": "P", "width": 80 * sc},
            {"title": "TOTAL\nHOURS", "width": 160 * sc}
        ]
        
        b_total_w = sum(c["width"] for c in b_cols)
        b_diff = content_w - b_total_w
        b_cols[2]["width"] += b_diff

        b_x = [margin_x]
        for c in b_cols:
            b_x.append(b_x[-1] + c["width"])

        b_table_top = cur_y
        b_h1 = 84 * sc
        b_h2 = 52 * sc
        b_row_h = 80 * sc

        total_sub_rows = len(subjects)
        b_table_bottom = b_table_top + b_h1 + b_h2 + total_sub_rows * b_row_h + b_row_h

        # Fill table header background
        h_line1_y = b_table_top + b_h1
        h_line2_y = h_line1_y + b_h2
        draw.rectangle([b_x[0], b_table_top, b_x[-1], h_line2_y], fill=self.header_bg)

        # Outer border
        draw.rectangle([b_x[0], b_table_top, b_x[-1], b_table_bottom], outline=self.line_color, width=self.outer_line_width)

        # Draw horizontal lines for headers
        draw.line([b_x[4], h_line1_y, b_x[7], h_line1_y], fill=self.line_color, width=self.line_width)
        draw.line([b_x[0], h_line2_y, b_x[-1], h_line2_y], fill=self.line_color, width=self.line_width)

        # Header cells
        self._draw_multiline_centered(draw, b_cols[0]["title"], (b_x[0], b_table_top, b_x[1], h_line2_y), self.font_th)
        draw.line([b_x[1], b_table_top, b_x[1], h_line2_y], fill=self.line_color, width=self.line_width)

        self._draw_multiline_centered(draw, b_cols[1]["title"], (b_x[1], b_table_top, b_x[2], h_line2_y), self.font_th)
        draw.line([b_x[2], b_table_top, b_x[2], h_line2_y], fill=self.line_color, width=self.line_width)

        self._draw_multiline_centered(draw, b_cols[2]["title"], (b_x[2], b_table_top, b_x[3], h_line2_y), self.font_th)
        draw.line([b_x[3], b_table_top, b_x[3], h_line2_y], fill=self.line_color, width=self.line_width)

        self._draw_multiline_centered(draw, b_cols[3]["title"], (b_x[3], b_table_top, b_x[4], h_line2_y), self.font_th)
        draw.line([b_x[4], b_table_top, b_x[4], h_line2_y], fill=self.line_color, width=self.line_width)

        self._draw_multiline_centered(draw, "NO. OF\nSESSIONS/\nWEEK", (b_x[4], b_table_top, b_x[7], h_line1_y), self.font_th)
        
        for s_idx, label in enumerate(["L", "T", "P"]):
            sx1, sx2 = b_x[4 + s_idx], b_x[5 + s_idx]
            self._draw_multiline_centered(draw, label, (sx1, h_line1_y, sx2, h_line2_y), self.font_th)
            draw.line([sx1, h_line1_y, sx1, h_line2_y], fill=self.line_color, width=self.line_width)
        draw.line([b_x[7], b_table_top, b_x[7], h_line2_y], fill=self.line_color, width=self.line_width)

        font_tot_hdr = self._load_font(self.font_bold_path, 24 * sc)
        self._draw_multiline_centered(draw, b_cols[7]["title"], (b_x[7], b_table_top, b_x[8], h_line2_y), font_tot_hdr, line_spacing=2)

        # Subject Data Rows
        row_cur_y = h_line2_y
        total_hours = 0

        for idx, sub in enumerate(subjects):
            s_y1 = row_cur_y
            s_y2 = s_y1 + b_row_h
            row_cur_y = s_y2

            draw.line([b_x[0], s_y2, b_x[-1], s_y2], fill=self.line_color, width=self.line_width)

            for vx in b_x[1:-1]:
                draw.line([vx, s_y1, vx, s_y2], fill=self.line_color, width=self.line_width)

            self._draw_multiline_centered(draw, str(idx + 1), (b_x[0], s_y1, b_x[1], s_y2), self.font_table_data)

            code_val = sub.get("code", "")
            self._draw_multiline_centered(draw, code_val, (b_x[1], s_y1, b_x[2], s_y2), self.font_table_data)

            sub_name = sub.get("name", "")
            wrapped_name = self._wrap_text(draw, sub_name, self.font_table_data, b_cols[2]["width"] - 20 * sc)
            self._draw_multiline_left(draw, wrapped_name, (b_x[2], s_y1, b_x[3], s_y2), self.font_table_data, pad_x=14)

            staff_val = sub.get("staff", "")
            wrapped_staff = self._wrap_text(draw, staff_val, self.font_table_data, b_cols[3]["width"] - 20 * sc)
            self._draw_multiline_left(draw, wrapped_staff, (b_x[3], s_y1, b_x[4], s_y2), self.font_table_data, pad_x=14)

            l_val = sub.get("l", 0)
            self._draw_multiline_centered(draw, str(l_val), (b_x[4], s_y1, b_x[5], s_y2), self.font_table_data)

            t_val = sub.get("t", 0)
            self._draw_multiline_centered(draw, str(t_val), (b_x[5], s_y1, b_x[6], s_y2), self.font_table_data)

            p_val = sub.get("p", 0)
            self._draw_multiline_centered(draw, str(p_val), (b_x[6], s_y1, b_x[7], s_y2), self.font_table_data)

            tot = sub.get("total", l_val + t_val + p_val)
            total_hours += tot
            self._draw_multiline_centered(draw, str(tot), (b_x[7], s_y1, b_x[8], s_y2), self.font_table_data)

        # Summary Row: "TOTAL HOURS PER WEEK"
        summary_y1 = row_cur_y
        summary_y2 = summary_y1 + b_row_h

        # Background fill for summary row
        draw.rectangle([b_x[0], summary_y1, b_x[-1], summary_y2], fill=self.summary_bg)

        # Vertical divider before total
        draw.line([b_x[7], summary_y1, b_x[7], summary_y2], fill=self.line_color, width=self.line_width)

        self._draw_multiline_centered(draw, "TOTAL HOURS PER WEEK", (b_x[0], summary_y1, b_x[7], summary_y2), self.font_table_data)
        self._draw_multiline_centered(draw, str(total_hours), (b_x[7], summary_y1, b_x[8], summary_y2), self.font_table_data)

        # Crop to used height with bottom margin
        final_height = summary_y2 + 80 * sc
        img_cropped = img.crop((0, 0, self.width, final_height))

        # Downsample with Lanczos if SSAA was applied
        if self.ssaa_scale > 1:
            target_w = self.base_width
            target_h = int(final_height / self.ssaa_scale)
            img_final = img_cropped.resize((target_w, target_h), resample=Image.Resampling.LANCZOS)
        else:
            img_final = img_cropped

        img_final.save(self.output_path, "PNG", quality=95)
        return self.output_path
