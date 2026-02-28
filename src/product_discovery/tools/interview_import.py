"""
Interview Import — parse real interview transcripts and extract structured insights.

Supports: .md, .txt, .docx files.
Extracts: insights, behavioral evidence, quotes, response quality scores.
Computes: Saturation Score (Sₙ = T_new / T_total) per interview.
"""

import json
import re
from dataclasses import dataclass, field, asdict
from datetime import datetime
from pathlib import Path
from typing import Optional


@dataclass
class ExtractedInsight:
    """A single insight extracted from an interview."""
    text: str
    category: str = "general"  # behavioral, opinion, workaround, quote
    evidence_type: str = "opinion"  # genuine, polite_lie, vague
    confidence: float = 0.5
    source_file: str = ""
    line_number: int = 0

    # Behavioral evidence markers (from KB)
    has_specific_artifacts: bool = False  # "Otworzyłem Excela"
    has_chronological_markers: bool = False  # "Potem sprawdziłem..."
    has_workaround: bool = False  # Describes unofficial process
    has_emotional_spike: bool = False  # Consistent emotional reaction


@dataclass
class InterviewAnalysis:
    """Analysis result for a single interview."""
    file_path: str
    insights: list[ExtractedInsight] = field(default_factory=list)
    raw_themes: list[str] = field(default_factory=list)
    new_themes: list[str] = field(default_factory=list)
    saturation_score: float = 1.0
    response_quality: dict = field(default_factory=lambda: {
        "genuine": 0, "polite_lie": 0, "vague": 0,
    })
    timestamp: str = field(default_factory=lambda: datetime.now().isoformat())

    @property
    def insight_density(self) -> float:
        """Key insights per interview (benchmark: 2-4 good)."""
        return len([i for i in self.insights if i.confidence >= 0.6])

    def to_dict(self) -> dict:
        return asdict(self)


@dataclass
class InterviewCorpus:
    """Collection of all interview analyses with running saturation tracking."""
    project_name: str
    analyses: list[InterviewAnalysis] = field(default_factory=list)
    all_themes: set = field(default_factory=set)

    def add_analysis(self, analysis: InterviewAnalysis) -> None:
        """Add analysis and compute saturation score."""
        new = set(analysis.raw_themes) - self.all_themes
        analysis.new_themes = list(new)

        total_after = len(self.all_themes | set(analysis.raw_themes))
        if total_after > 0:
            analysis.saturation_score = len(new) / total_after
        else:
            analysis.saturation_score = 1.0

        self.all_themes.update(analysis.raw_themes)
        self.analyses.append(analysis)

    @property
    def is_saturated(self) -> bool:
        """Sₙ < 0.05 = saturation reached."""
        if not self.analyses:
            return False
        return self.analyses[-1].saturation_score < 0.05

    @property
    def total_insights(self) -> int:
        return sum(len(a.insights) for a in self.analyses)

    @property
    def total_themes(self) -> int:
        return len(self.all_themes)

    def save(self, output_dir: str) -> Path:
        """Persist corpus to JSON."""
        path = Path(output_dir) / self.project_name
        path.mkdir(parents=True, exist_ok=True)
        out_file = path / "interview_corpus.json"

        data = {
            "project_name": self.project_name,
            "total_interviews": len(self.analyses),
            "total_insights": self.total_insights,
            "total_themes": self.total_themes,
            "is_saturated": self.is_saturated,
            "all_themes": sorted(self.all_themes),
            "analyses": [a.to_dict() for a in self.analyses],
        }
        out_file.write_text(json.dumps(data, indent=2, ensure_ascii=False), encoding="utf-8")
        return out_file

    @classmethod
    def load(cls, project_name: str, output_dir: str = "projects") -> "InterviewCorpus":
        """Load existing corpus or create new."""
        path = Path(output_dir) / project_name / "interview_corpus.json"
        if path.exists():
            data = json.loads(path.read_text(encoding="utf-8"))
            corpus = cls(project_name=project_name)
            corpus.all_themes = set(data.get("all_themes", []))
            for a_data in data.get("analyses", []):
                insights = [ExtractedInsight(**i) for i in a_data.get("insights", [])]
                analysis = InterviewAnalysis(
                    file_path=a_data["file_path"],
                    insights=insights,
                    raw_themes=a_data.get("raw_themes", []),
                    new_themes=a_data.get("new_themes", []),
                    saturation_score=a_data.get("saturation_score", 1.0),
                    response_quality=a_data.get("response_quality", {}),
                    timestamp=a_data.get("timestamp", ""),
                )
                corpus.analyses.append(analysis)
            return corpus
        return cls(project_name=project_name)


def read_interview_file(file_path: Path) -> str:
    """Read interview transcript from supported file formats."""
    suffix = file_path.suffix.lower()

    if suffix in (".md", ".txt"):
        return file_path.read_text(encoding="utf-8")
    elif suffix == ".docx":
        try:
            from docx import Document
            doc = Document(str(file_path))
            return "\n".join(p.text for p in doc.paragraphs)
        except ImportError:
            raise ImportError(
                "python-docx required for .docx import: pip install product-discovery[docx]"
            )
    else:
        raise ValueError(f"Unsupported file format: {suffix}. Use .md, .txt, or .docx")


# --- Heuristic extraction (no LLM needed) ---

_BEHAVIORAL_MARKERS = [
    r"\b(otworzyłem|sprawdziłem|kliknąłem|napisałem|zadzwoniłem|wysłałem)\b",
    r"\b(opened|clicked|checked|called|sent|downloaded|searched|emailed)\b",
    r"\b(potem|następnie|najpierw|wcześniej|po tym)\b",
    r"\b(then|after that|first|before|next|previously)\b",
]

_VAGUE_MARKERS = [
    r"\b(mógłbym|mógłbym|zazwyczaj|generalnie|chyba|pewnie)\b",
    r"\b(could|would|might|usually|generally|probably|maybe)\b",
]

_POLITE_LIE_MARKERS = [
    r"\b(niesamowite|świetne|rewelacyjne|super pomysł|na pewno bym)\b",
    r"\b(amazing|awesome|love it|definitely would|great idea|brilliant)\b",
]


def classify_response_quality(text: str) -> str:
    """Heuristic classification: genuine / polite_lie / vague."""
    text_lower = text.lower()

    behavioral_count = sum(
        len(re.findall(p, text_lower, re.IGNORECASE)) for p in _BEHAVIORAL_MARKERS
    )
    vague_count = sum(
        len(re.findall(p, text_lower, re.IGNORECASE)) for p in _VAGUE_MARKERS
    )
    polite_count = sum(
        len(re.findall(p, text_lower, re.IGNORECASE)) for p in _POLITE_LIE_MARKERS
    )

    if behavioral_count >= 2:
        return "genuine"
    elif polite_count >= 2:
        return "polite_lie"
    elif vague_count >= 2:
        return "vague"
    elif behavioral_count >= 1:
        return "genuine"
    else:
        return "vague"


def extract_themes_heuristic(text: str) -> list[str]:
    """Extract themes/topics from interview text using keyword clustering."""
    themes = []
    text_lower = text.lower()

    theme_keywords = {
        "pricing": ["cena", "koszt", "price", "cost", "budget", "budżet", "pay", "zapłac"],
        "onboarding": ["onboarding", "start", "beginning", "początek", "setup", "konfiguracja"],
        "ux_friction": ["trudne", "difficult", "confusing", "mylące", "nie rozumiem", "don't understand"],
        "competition": ["konkurencja", "competitor", "alternative", "alternatywa", "inne narzędzie"],
        "time_savings": ["czas", "time", "szybciej", "faster", "oszczędność", "saves"],
        "integration": ["integracja", "integration", "api", "connect", "połączenie", "sync"],
        "security": ["bezpieczeństwo", "security", "privacy", "prywatność", "gdpr", "rodo"],
        "collaboration": ["współpraca", "collaboration", "team", "zespół", "sharing", "udostępnianie"],
        "reporting": ["raport", "report", "dashboard", "analytics", "analityka", "metrics"],
        "automation": ["automatyzacja", "automation", "automat", "workflow", "bot"],
        "mobile": ["mobile", "telefon", "app", "aplikacja mobilna"],
        "support": ["wsparcie", "support", "help", "pomoc", "dokumentacja"],
        "workaround": ["obejście", "workaround", "hack", "trick", "sposób na"],
        "frustration": ["frustracja", "frustration", "irytujące", "annoying", "problem"],
        "switching": ["zmiana", "switch", "migration", "migracja", "przenosimy się"],
    }

    for theme, keywords in theme_keywords.items():
        if any(kw in text_lower for kw in keywords):
            themes.append(theme)

    return themes


def extract_insights_heuristic(text: str, file_path: str = "") -> list[ExtractedInsight]:
    """Extract insights from interview text using heuristic rules."""
    insights = []

    # Split into paragraphs / responses
    paragraphs = [p.strip() for p in re.split(r"\n{2,}", text) if len(p.strip()) > 50]

    for i, para in enumerate(paragraphs):
        quality = classify_response_quality(para)

        # Check behavioral markers
        has_artifacts = bool(re.search(
            r"\b(excel|slack|email|jira|trello|notion|google|figma|miro)\b",
            para, re.IGNORECASE,
        ))
        has_chrono = bool(re.search(
            r"\b(potem|następnie|najpierw|then|after|first|next)\b",
            para, re.IGNORECASE,
        ))
        has_workaround = bool(re.search(
            r"\b(obejście|workaround|hack|sposób na|instead I|zamiast tego)\b",
            para, re.IGNORECASE,
        ))

        # Score confidence based on evidence quality
        confidence = 0.3
        if quality == "genuine":
            confidence = 0.7
        if has_artifacts:
            confidence += 0.1
        if has_chrono:
            confidence += 0.1
        if has_workaround:
            confidence += 0.1

        # Determine category
        category = "opinion"
        if has_workaround:
            category = "workaround"
        elif quality == "genuine":
            category = "behavioral"
        elif quality == "polite_lie":
            category = "opinion"

        insight = ExtractedInsight(
            text=para[:500],  # Trim to 500 chars
            category=category,
            evidence_type=quality,
            confidence=min(1.0, confidence),
            source_file=file_path,
            line_number=i + 1,
            has_specific_artifacts=has_artifacts,
            has_chronological_markers=has_chrono,
            has_workaround=has_workaround,
        )
        insights.append(insight)

    return insights


def analyze_interview(file_path: Path) -> InterviewAnalysis:
    """Full analysis pipeline for a single interview file."""
    text = read_interview_file(file_path)
    insights = extract_insights_heuristic(text, str(file_path))
    themes = extract_themes_heuristic(text)

    quality_counts = {"genuine": 0, "polite_lie": 0, "vague": 0}
    for insight in insights:
        if insight.evidence_type in quality_counts:
            quality_counts[insight.evidence_type] += 1

    return InterviewAnalysis(
        file_path=str(file_path),
        insights=insights,
        raw_themes=themes,
        response_quality=quality_counts,
    )


def import_interviews(
    project_name: str,
    files: list[Path],
    output_dir: str = "projects",
) -> InterviewCorpus:
    """Import multiple interview files into a project corpus."""
    corpus = InterviewCorpus.load(project_name, output_dir)

    for file_path in files:
        print(f"📋 Analyzing: {file_path.name}")
        analysis = analyze_interview(file_path)
        corpus.add_analysis(analysis)

        quality = analysis.response_quality
        total_q = sum(quality.values()) or 1
        print(f"   Insights: {len(analysis.insights)} "
              f"(genuine: {quality['genuine']}, "
              f"polite_lie: {quality['polite_lie']}, "
              f"vague: {quality['vague']})")
        print(f"   Themes: {', '.join(analysis.raw_themes) or 'none detected'}")
        print(f"   New themes: {', '.join(analysis.new_themes) or 'none (saturating)'}")
        print(f"   Saturation Score: {analysis.saturation_score:.2%}")
        print(f"   Insight density: {analysis.insight_density}")
        print()

    # Save
    out_file = corpus.save(output_dir)
    print(f"{'='*50}")
    print(f"📊 Total interviews: {len(corpus.analyses)}")
    print(f"📊 Total insights: {corpus.total_insights}")
    print(f"📊 Total themes: {corpus.total_themes}")
    print(f"📊 Saturated: {'✅ YES' if corpus.is_saturated else '❌ NO'}")
    print(f"💾 Saved to: {out_file}")

    return corpus
