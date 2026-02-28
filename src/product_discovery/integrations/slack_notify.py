"""
Slack Integration — webhook-based notifications for discovery events.

Uses incoming webhooks (no OAuth needed): set SLACK_WEBHOOK_URL in .env.
Sends rich messages with verdict badges, key metrics, and report links.
"""

import json
from datetime import datetime
from typing import Optional

import requests


def send_slack_notification(
    webhook_url: str,
    project_name: str,
    event: str = "discovery_complete",
    discovery_data: Optional[dict] = None,
    report_url: str = "",
    custom_message: str = "",
) -> bool:
    """Send a Slack notification via incoming webhook.

    Args:
        webhook_url: Slack incoming webhook URL
        project_name: Project name
        event: Event type (discovery_complete, assumption_update, weekly_digest)
        discovery_data: Discovery data dict
        report_url: URL to the report (if available)
        custom_message: Custom text to append

    Returns:
        True if sent successfully
    """
    data = discovery_data or {}

    if event == "discovery_complete":
        payload = _build_discovery_complete(project_name, data, report_url)
    elif event == "assumption_update":
        payload = _build_assumption_update(project_name, data)
    elif event == "weekly_digest":
        payload = _build_weekly_digest(project_name, data)
    else:
        payload = _build_generic(project_name, custom_message or event)

    try:
        resp = requests.post(
            webhook_url,
            json=payload,
            headers={"Content-Type": "application/json"},
            timeout=10,
        )
        resp.raise_for_status()
        print(f"✅ Slack notification sent: {event}")
        return True
    except requests.RequestException as e:
        print(f"❌ Slack notification failed: {e}")
        return False


def _build_discovery_complete(project_name: str, data: dict, report_url: str) -> dict:
    verdict = data.get("verdict", "NEEDS_MORE_DATA")
    verdict_emoji = {"GO": "✅", "NO-GO": "❌", "NEEDS_MORE_DATA": "⚠️"}.get(verdict, "❓")

    blocks = [
        {
            "type": "header",
            "text": {"type": "plain_text", "text": f"🔍 Discovery Complete: {project_name}"}
        },
        {
            "type": "section",
            "fields": [
                {"type": "mrkdwn", "text": f"*Verdict:* {verdict_emoji} {verdict}"},
                {"type": "mrkdwn", "text": f"*Confidence:* {data.get('confidence', '?')}%"},
                {"type": "mrkdwn", "text": f"*Evidence:* {data.get('evidence_level', '?')}"},
                {"type": "mrkdwn", "text": f"*Interviews:* {data.get('interviews_count', '?')}"},
            ],
        },
    ]

    if data.get("functional_job"):
        blocks.append({
            "type": "section",
            "text": {"type": "mrkdwn", "text": f"*JTBD:* {data['functional_job'][:100]}"},
        })

    if report_url:
        blocks.append({
            "type": "actions",
            "elements": [{
                "type": "button",
                "text": {"type": "plain_text", "text": "📄 View Report"},
                "url": report_url,
            }],
        })

    blocks.append({
        "type": "context",
        "elements": [{"type": "mrkdwn", "text": f"Product Discovery v1.0 | {datetime.now().strftime('%Y-%m-%d %H:%M')}"}],
    })

    return {"blocks": blocks}


def _build_assumption_update(project_name: str, data: dict) -> dict:
    assumptions = data.get("assumptions_data", [])
    tested = [a for a in assumptions if a.get("status") in ("validated", "invalidated")]
    total = len(assumptions)

    return {
        "blocks": [
            {
                "type": "header",
                "text": {"type": "plain_text", "text": f"🗺️ Assumptions Update: {project_name}"}
            },
            {
                "type": "section",
                "fields": [
                    {"type": "mrkdwn", "text": f"*Total:* {total}"},
                    {"type": "mrkdwn", "text": f"*Tested:* {len(tested)}"},
                    {"type": "mrkdwn", "text": f"*Validated:* {sum(1 for a in tested if a.get('status') == 'validated')}"},
                    {"type": "mrkdwn", "text": f"*Invalidated:* {sum(1 for a in tested if a.get('status') == 'invalidated')}"},
                ],
            },
        ]
    }


def _build_weekly_digest(project_name: str, data: dict) -> dict:
    return {
        "blocks": [
            {
                "type": "header",
                "text": {"type": "plain_text", "text": f"📊 Weekly Discovery Digest: {project_name}"}
            },
            {
                "type": "section",
                "text": {"type": "mrkdwn", "text": (
                    f"• Evidence: {data.get('evidence_level', '?')}\n"
                    f"• Interviews: {data.get('interviews_count', '?')}\n"
                    f"• Assumptions tested: {data.get('assumptions_tested', '?')}\n"
                    f"• Industry context: {data.get('industry_completeness', '?')}% complete"
                )},
            },
        ]
    }


def _build_generic(project_name: str, message: str) -> dict:
    return {
        "blocks": [
            {
                "type": "section",
                "text": {"type": "mrkdwn", "text": f"🔍 *{project_name}*: {message}"},
            },
        ]
    }
