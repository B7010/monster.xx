"""
Timetable Scheduling Engine with Constraint Satisfaction.
Assigns staff & subjects to periods without conflicts, grouping lab sessions
into contiguous blocks and balancing theory lectures across days.
"""

import random
from typing import List, Dict, Any, Optional, Tuple


class TimetableScheduler:
    def __init__(self, config: Dict[str, Any]):
        self.config = config
        self.days = config.get("days", ["Mon", "Tue", "Wed", "Thu", "Fri"])
        self.num_days = len(self.days)
        self.periods_per_day = config.get("periods_per_day", 7)
        self.break_after = config.get("break_after_period", 2)  # 1-indexed (e.g. after P2)
        self.lunch_after = config.get("lunch_after_period", 4)  # 1-indexed (e.g. after P4)
        self.subjects = config.get("subjects", [])

    def _get_valid_blocks(self) -> List[Tuple[int, int, int]]:
        """
        Returns list of (day_idx, start_period, length) continuous blocks
        that do not cross breaks or lunches.
        Periods are 0-indexed.
        """
        # Define period chunks separated by break and lunch
        chunks = [
            (0, self.break_after),                              # Morning 1: e.g. 0..2
            (self.break_after, self.lunch_after),              # Morning 2: e.g. 2..4
            (self.lunch_after, self.periods_per_day)           # Afternoon: e.g. 4..7
        ]
        
        blocks = []
        for d in range(self.num_days):
            for start, end in chunks:
                length = end - start
                if length > 1:
                    blocks.append((d, start, length))
        return blocks

    def schedule(self, seed: Optional[int] = None) -> List[List[Dict[str, Any]]]:
        """
        Generates a conflict-free timetable grid:
        grid[day_idx][period_idx] = {
            "code": "CS25C08",
            "display": "CS25C08(LAB)",
            "is_lab": True,
            "subject_name": "DATA STRUCTURES",
            "staff": "MRS.SUGANYA,AP/AI&DS",
            "span": 1,
            "is_continuation": False
        }
        """
        if seed is not None:
            random.seed(seed)

        # Initialize grid
        grid: List[List[Optional[Dict[str, Any]]]] = [
            [None for _ in range(self.periods_per_day)] for _ in range(self.num_days)
        ]

        # Separate items into Lab Sessions (requiring blocks) and Theory Sessions
        lab_items = []
        theory_items = []

        for sub in self.subjects:
            code = sub.get("code", "")
            name = sub.get("name", "")
            staff = sub.get("staff", "")
            l = sub.get("l", 0)
            t = sub.get("t", 0)
            p = sub.get("p", 0)
            disp = sub.get("display_code") or code or name
            lab_disp = sub.get("lab_display_code") or f"{disp}(LAB)" if p > 0 else disp
            block_size = sub.get("lab_block_size", 2 if p in (2, 4) else (3 if p >= 3 else 1))

            # Break practical hours into blocks
            remaining_p = p
            while remaining_p > 0:
                bs = min(remaining_p, block_size)
                # If 1 remaining, combine or single
                lab_items.append({
                    "subject": sub,
                    "code": code,
                    "name": name,
                    "staff": staff,
                    "display": lab_disp,
                    "is_lab": True,
                    "length": bs
                })
                remaining_p -= bs

            # Theory & Tutorials are single periods
            for _ in range(l + t):
                theory_items.append({
                    "subject": sub,
                    "code": code,
                    "name": name,
                    "staff": staff,
                    "display": disp,
                    "is_lab": False,
                    "length": 1
                })

        # Sort lab items by length descending so larger blocks get placed first
        lab_items.sort(key=lambda x: x["length"], reverse=True)

        # 1. Place Lab Blocks
        for item in lab_items:
            placed = False
            needed_len = item["length"]
            
            # Find best slot across days
            candidate_slots = []
            valid_blocks = self._get_valid_blocks()
            random.shuffle(valid_blocks)

            for d, start_p, max_len in valid_blocks:
                # Check if subject already has a lab on this day
                has_lab_today = any(
                    grid[d][p] is not None and grid[d][p]["code"] == item["code"] and grid[d][p]["is_lab"]
                    for p in range(self.periods_per_day)
                )
                if has_lab_today and len(self.days) >= len(lab_items):
                    continue

                for p_offset in range(max_len - needed_len + 1):
                    p_start = start_p + p_offset
                    # Check if slots are free and staff is free
                    if all(grid[d][p_start + i] is None for i in range(needed_len)):
                        candidate_slots.append((d, p_start))

            if candidate_slots:
                # Pick one with least items assigned on that day
                candidate_slots.sort(key=lambda x: sum(1 for p in range(self.periods_per_day) if grid[x[0]][p] is not None))
                d, p_start = candidate_slots[0]
                for i in range(needed_len):
                    grid[d][p_start + i] = {
                        "code": item["code"],
                        "display": item["display"],
                        "subject_name": item["name"],
                        "staff": item["staff"],
                        "is_lab": True,
                        "span": needed_len if i == 0 else 1,
                        "is_continuation": (i > 0)
                    }
                placed = True
            else:
                # Fallback: place single slots anywhere available
                for _ in range(needed_len):
                    theory_items.append({
                        "subject": item["subject"],
                        "code": item["code"],
                        "name": item["name"],
                        "staff": item["staff"],
                        "display": item["display"],
                        "is_lab": True,
                        "length": 1
                    })

        # 2. Place Theory & Remaining Sessions
        # Shuffle for evenness
        random.shuffle(theory_items)
        # Prioritize subjects with most theory hours
        theory_counts = {}
        for item in theory_items:
            theory_counts[item["code"]] = theory_counts.get(item["code"], 0) + 1
        theory_items.sort(key=lambda x: theory_counts[x["code"]], reverse=True)

        for item in theory_items:
            best_day = None
            best_period = None
            min_day_load = 999

            # Evaluate days where this subject isn't already taught (or taught least)
            candidate_days = list(range(self.num_days))
            random.shuffle(candidate_days)
            candidate_days.sort(key=lambda d: sum(
                1 for p in range(self.periods_per_day)
                if grid[d][p] is not None and grid[d][p]["code"] == item["code"]
            ))

            for d in candidate_days:
                free_periods = [p for p in range(self.periods_per_day) if grid[d][p] is None]
                if free_periods:
                    # Prefer earlier periods for core theory, or spread
                    best_day = d
                    best_period = free_periods[0]
                    break

            if best_day is not None and best_period is not None:
                grid[best_day][best_period] = {
                    "code": item["code"],
                    "display": item["display"],
                    "subject_name": item["name"],
                    "staff": item["staff"],
                    "is_lab": item["is_lab"],
                    "span": 1,
                    "is_continuation": False
                }

        # Fill any remaining None with empty slot representation
        result_grid = []
        for d in range(self.num_days):
            day_row = []
            for p in range(self.periods_per_day):
                cell = grid[d][p]
                if cell is None:
                    day_row.append({
                        "code": "",
                        "display": "-",
                        "subject_name": "Free / Self Study",
                        "staff": "",
                        "is_lab": False,
                        "span": 1,
                        "is_continuation": False
                    })
                else:
                    day_row.append(cell)
            result_grid.append(day_row)

        # Calculate spans for adjacent identical lab cells
        self._calculate_spans(result_grid)
        return result_grid

    def _calculate_spans(self, grid: List[List[Dict[str, Any]]]):
        """
        Updates span and continuation flags so consecutive identical lab cells
        render properly as merged cells without crossing break or lunch.
        """
        chunks = [
            (0, self.break_after),
            (self.break_after, self.lunch_after),
            (self.lunch_after, self.periods_per_day)
        ]

        for d in range(self.num_days):
            for start, end in chunks:
                p = start
                while p < end:
                    curr = grid[d][p]
                    if not curr["display"] or curr["display"] == "-":
                        p += 1
                        continue

                    # Look ahead within this chunk
                    span = 1
                    while (p + span < end and
                           grid[d][p + span]["display"] == curr["display"] and
                           grid[d][p + span]["is_lab"]):
                        span += 1

                    if span > 1:
                        grid[d][p]["span"] = span
                        grid[d][p]["is_continuation"] = False
                        for s in range(1, span):
                            grid[d][p + s]["span"] = 1
                            grid[d][p + s]["is_continuation"] = True
                        p += span
                    else:
                        grid[d][p]["span"] = 1
                        grid[d][p]["is_continuation"] = False
                        p += 1


def get_sample_scad_schedule() -> List[List[Dict[str, Any]]]:
    """
    Returns the exact timetable schedule from the SCAD College sample image.
    Used for instant 1:1 reproduction or baseline comparison.
    """
    # 5 days x 7 periods
    # Mon
    mon = [
        {"code": "", "display": "NM", "subject_name": "NAAN MUDHALVAN", "staff": "MRS.SUGANYA,AP/AI&DS", "span": 2, "is_continuation": False, "is_lab": True},
        {"code": "", "display": "NM", "subject_name": "NAAN MUDHALVAN", "staff": "MRS.SUGANYA,AP/AI&DS", "span": 1, "is_continuation": True, "is_lab": True},
        {"code": "", "display": "NM", "subject_name": "NAAN MUDHALVAN", "staff": "MRS.SUGANYA,AP/AI&DS", "span": 2, "is_continuation": False, "is_lab": True},
        {"code": "", "display": "NM", "subject_name": "NAAN MUDHALVAN", "staff": "MRS.SUGANYA,AP/AI&DS", "span": 1, "is_continuation": True, "is_lab": True},
        {"code": "CW25201", "display": "CW25201", "subject_name": "COMPUTER ORGANIZATION AND ARCHITECTURE", "staff": "MR.M.SUBRAMANIAN, AP/AI&DS", "span": 1, "is_continuation": False, "is_lab": False},
        {"code": "CS25C07", "display": "CS25C07", "subject_name": "OBJECT ORIENTED PROGRAMMING", "staff": "MR.MOHAN,AP/AI&DS", "span": 1, "is_continuation": False, "is_lab": False},
        {"code": "", "display": "CLUB\nACTIVITIES", "subject_name": "CLUB ACTIVITIES", "staff": "MS.RAMALAKSHMI,AP/AI&DS", "span": 1, "is_continuation": False, "is_lab": False}
    ]

    # Tue
    tue = [
        {"code": "MA25C08", "display": "MA25C08", "subject_name": "DISCRETE MATHEMATICS", "staff": "DR.T.JACKULINE,S&H", "span": 1, "is_continuation": False, "is_lab": False},
        {"code": "CS25C07", "display": "CS25C07", "subject_name": "OBJECT ORIENTED PROGRAMMING", "staff": "MR.MOHAN,AP/AI&DS", "span": 1, "is_continuation": False, "is_lab": False},
        {"code": "IT25301", "display": "IT25301", "subject_name": "WEB TECHNOLOGIES", "staff": "MRS. J. JEENATHKAMILA,AP/AI&DS", "span": 1, "is_continuation": False, "is_lab": False},
        {"code": "CS25C08", "display": "CS25C08\n(LAB)", "subject_name": "DATA STRUCTURES", "staff": "MRS.SUGANYA,AP/AI&DS", "span": 1, "is_continuation": False, "is_lab": True},
        {"code": "CS25C08", "display": "CS25C08(LAB)", "subject_name": "DATA STRUCTURES", "staff": "MRS.SUGANYA,AP/AI&DS", "span": 3, "is_continuation": False, "is_lab": True},
        {"code": "CS25C08", "display": "CS25C08(LAB)", "subject_name": "DATA STRUCTURES", "staff": "MRS.SUGANYA,AP/AI&DS", "span": 1, "is_continuation": True, "is_lab": True},
        {"code": "CS25C08", "display": "CS25C08(LAB)", "subject_name": "DATA STRUCTURES", "staff": "MRS.SUGANYA,AP/AI&DS", "span": 1, "is_continuation": True, "is_lab": True}
    ]

    # Wed
    wed = [
        {"code": "CS25C08", "display": "CS25C08", "subject_name": "DATA STRUCTURES", "staff": "MRS.SUGANYA,AP/AI&DS", "span": 1, "is_continuation": False, "is_lab": False},
        {"code": "MA25C08", "display": "MA25C08", "subject_name": "DISCRETE MATHEMATICS", "staff": "DR.T.JACKULINE,S&H", "span": 1, "is_continuation": False, "is_lab": False},
        {"code": "IT25301", "display": "IT25301", "subject_name": "WEB TECHNOLOGIES", "staff": "MRS. J. JEENATHKAMILA,AP/AI&DS", "span": 1, "is_continuation": False, "is_lab": False},
        {"code": "", "display": "Mentor\nhour", "subject_name": "MENTOR HOUR", "staff": "MRS.SUGANYA,AP/AI&DS", "span": 1, "is_continuation": False, "is_lab": False},
        {"code": "CS25C07", "display": "CS25C07(LAB)", "subject_name": "OBJECT ORIENTED PROGRAMMING", "staff": "MR.MOHAN,AP/AI&DS", "span": 3, "is_continuation": False, "is_lab": True},
        {"code": "CS25C07", "display": "CS25C07(LAB)", "subject_name": "OBJECT ORIENTED PROGRAMMING", "staff": "MR.MOHAN,AP/AI&DS", "span": 1, "is_continuation": True, "is_lab": True},
        {"code": "CS25C07", "display": "CS25C07(LAB)", "subject_name": "OBJECT ORIENTED PROGRAMMING", "staff": "MR.MOHAN,AP/AI&DS", "span": 1, "is_continuation": True, "is_lab": True}
    ]

    # Thu
    thu = [
        {"code": "IT25301", "display": "IT25301", "subject_name": "WEB TECHNOLOGIES", "staff": "MRS. J. JEENATHKAMILA,AP/AI&DS", "span": 1, "is_continuation": False, "is_lab": False},
        {"code": "IT25301", "display": "IT25301\n(Lab)", "subject_name": "WEB TECHNOLOGIES", "staff": "MRS. J. JEENATHKAMILA,AP/AI&DS", "span": 1, "is_continuation": False, "is_lab": True},
        {"code": "IT25301", "display": "IT25301\n(Lab)", "subject_name": "WEB TECHNOLOGIES", "staff": "MRS. J. JEENATHKAMILA,AP/AI&DS", "span": 1, "is_continuation": False, "is_lab": True},
        {"code": "MA25C08", "display": "MA25C08", "subject_name": "DISCRETE MATHEMATICS", "staff": "DR.T.JACKULINE,S&H", "span": 1, "is_continuation": False, "is_lab": False},
        {"code": "CS25C08", "display": "CS25C08", "subject_name": "DATA STRUCTURES", "staff": "MRS.SUGANYA,AP/AI&DS", "span": 1, "is_continuation": False, "is_lab": False},
        {"code": "", "display": "English\ncommunication (lab)", "subject_name": "ENGLISH COMMUNICATION SKILLS LABORATORY - II", "staff": "MR.DANI ABRAHAM,AP/S&H", "span": 2, "is_continuation": False, "is_lab": True},
        {"code": "", "display": "English\ncommunication (lab)", "subject_name": "ENGLISH COMMUNICATION SKILLS LABORATORY - II", "staff": "MR.DANI ABRAHAM,AP/S&H", "span": 1, "is_continuation": True, "is_lab": True}
    ]

    # Fri
    fri = [
        {"code": "CW25201", "display": "CW25201", "subject_name": "COMPUTER ORGANIZATION AND ARCHITECTURE", "staff": "MR.M.SUBRAMANIAN, AP/AI&DS", "span": 1, "is_continuation": False, "is_lab": False},
        {"code": "CS25C07", "display": "CS25C07", "subject_name": "OBJECT ORIENTED PROGRAMMING", "staff": "MR.MOHAN,AP/AI&DS", "span": 1, "is_continuation": False, "is_lab": False},
        {"code": "CW25201", "display": "CW25201", "subject_name": "COMPUTER ORGANIZATION AND ARCHITECTURE", "staff": "MR.M.SUBRAMANIAN, AP/AI&DS", "span": 1, "is_continuation": False, "is_lab": False},
        {"code": "", "display": "CLUB\nACTIVITIES", "subject_name": "CLUB ACTIVITIES", "staff": "MS.RAMALAKSHMI,AP/AI&DS", "span": 1, "is_continuation": False, "is_lab": False},
        {"code": "CS25C07", "display": "CS25C07\n(LAB)", "subject_name": "OBJECT ORIENTED PROGRAMMING", "staff": "MR.MOHAN,AP/AI&DS", "span": 1, "is_continuation": False, "is_lab": True},
        {"code": "CS25C08", "display": "CS25C08", "subject_name": "DATA STRUCTURES", "staff": "MRS.SUGANYA,AP/AI&DS", "span": 1, "is_continuation": False, "is_lab": False},
        {"code": "MA25C08", "display": "MA25C08", "subject_name": "DISCRETE MATHEMATICS", "staff": "DR.T.JACKULINE,S&H", "span": 1, "is_continuation": False, "is_lab": False}
    ]

    return [mon, tue, wed, thu, fri]
