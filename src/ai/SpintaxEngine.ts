// src/ai/SpintaxEngine.ts - Dynamic Email Content Generator for VME
// Generates human-like, varied email subjects and bodies with no fixed pattern.

export interface GeneratedContent {
  subject: string;
  body: string;
  html: string;
}

export class SpintaxEngine {

  // ============================================
  // SUBJECT TEMPLATES
  // ============================================
  private static subjects = [
    "{Quick|Brief|Short} {question|thought|check-in} about {the project|our collaboration|next steps|the timeline}",
    "{Following up|Checking in|Touching base} on {the proposal|our discussion|the plan|what we talked about}",
    "Thoughts on {the timeline|the approach|moving forward|our next steps}?",
    "{Re:|Regarding:} {our last chat|the recent update|what we discussed|the proposal}",
    "{Have you had|Did you get} a {chance|moment} to {review|look at|check} {the doc|the update|what I sent}?",
    "Just {wanted to|thought I'd} {follow up|check in|reach out} {quickly|briefly}",
    "{Quick|Fast} {update|note|heads up} on {the project|our work|what's next}",
    "{Circling back|Coming back} to {our conversation|what we discussed|the proposal}",
    "Any {updates|news|progress} on {your end|the project|the timeline}?",
    "{Hi|Hey|Hello} — {just a quick|a brief|a fast} {note|message|thought}",
    "{Wanted to|Thought I'd} {share|send over|pass along} {a quick update|some thoughts|a few notes}",
    "Let's {sync|connect|catch up} about {the project|next steps|the plan}",
    "{Checking in|Following up} — {how's it going|any updates|where do we stand}?",
    "{One|A} {quick|small} {question|thing|note} for you",
    "Can we {align on|discuss|go over} {the next steps|the timeline|the approach}?",
  ];

  // ============================================
  // OPENING LINES
  // ============================================
  private static openings = [
    "Hope this finds you well.",
    "Hope you're having a great week.",
    "Hope all is going well on your end.",
    "Trust you're doing well.",
    "Hope this message finds you in good spirits.",
    "Just wanted to quickly reach out.",
    "Wanted to drop you a quick line.",
    "Hope things are going smoothly on your end.",
    "Trust things are going well with you.",
    "Hope your week is off to a great start.",
    "Just a quick note from my end.",
  ];

  // ============================================
  // MIDDLE CONTENT TEMPLATES
  // ============================================
  private static middles = [
    "I wanted to {follow up|check in|touch base} on {our previous discussion|what we talked about|the project}. {Where do we stand|Any updates on your end|How's it progressing}?",
    "{Just checking in|Wanted to see} if you had a chance to {review|look over|go through} {what I sent over|the documents|the proposal|the update}.",
    "I {wanted to|thought I'd} {share a quick update|send over some thoughts|pass along a few notes} on {where things stand|the current status|the next steps}.",
    "I've been {thinking about|working on|reviewing} {our last conversation|the proposal|the project} and {wanted to|thought I'd} {share some thoughts|get your input|check in}.",
    "{Any progress|Any updates|Any news} on {the project|your end|the timeline|the deliverables}? {Happy to|I can} {jump on a call|send more details|answer any questions} if needed.",
    "I {believe|think} we {should|need to} {align on|discuss|review} {the next steps|the plan|the approach} {before we move forward|soon|when you get a chance}.",
    "Wanted to make sure {we're aligned|we're on the same page|everything is clear} on {the priorities|the timeline|the next steps|our plan}.",
    "Could you {share your thoughts|give me an update|let me know your thoughts} on {this|the proposal|the timeline|what we discussed}?",
  ];

  // ============================================
  // CLOSING LINES
  // ============================================
  private static closings = [
    "Looking forward to hearing from you.",
    "Let me know if you have any questions.",
    "Happy to discuss further if needed.",
    "Looking forward to connecting soon.",
    "Feel free to reach out if anything comes up.",
    "Let me know your thoughts when you get a chance.",
    "Excited to hear your thoughts.",
    "Looking forward to your response.",
    "Let me know how you'd like to proceed.",
    "Happy to jump on a call if it's easier.",
  ];

  // ============================================
  // SIGNATURES
  // ============================================
  private static signatures = [
    "Best,",
    "Cheers,",
    "Thanks,",
    "Best regards,",
    "Kind regards,",
    "Warm regards,",
    "Thanks and regards,",
    "Talk soon,",
  ];

  // ============================================
  // CORE SPIN METHOD
  // ============================================
  private static spin(template: string): string {
    return template.replace(/\{([^}]+)\}/g, (_, options) => {
      const choices = options.split('|');
      return choices[Math.floor(Math.random() * choices.length)].trim();
    });
  }

  private static pick<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  // ============================================
  // GENERATE SUBJECT
  // ============================================
  static generateSubject(): string {
    return this.spin(this.pick(this.subjects));
  }

  // ============================================
  // GENERATE BODY (plain text)
  // ============================================
  static generateBody(senderName?: string): string {
    const opening = this.pick(this.openings);
    const middle = this.spin(this.pick(this.middles));
    const closing = this.pick(this.closings);
    const signature = this.pick(this.signatures);
    const name = senderName || 'the team';

    return `${opening}\n\n${middle}\n\n${closing}\n\n${signature}\n${name}`;
  }

  // ============================================
  // GENERATE REPLY BODY
  // ============================================
  static generateReplyBody(originalSubject: string, senderName?: string): string {
    const replyOpenings = [
      `Thanks for reaching out.`,
      `Appreciate you getting back to me.`,
      `Thanks for the update.`,
      `Good to hear from you.`,
      `Thanks for your message.`,
      `Appreciate you following up.`,
    ];

    const replyMiddles = [
      `I'll look into this and get back to you shortly.`,
      `That sounds good to me. Let's move forward.`,
      `I've reviewed what you sent and it looks good.`,
      `I'll review this and follow up with any questions.`,
      `This is helpful, thank you. I'll get back to you soon.`,
      `Noted, thanks. I'll take a look and circle back.`,
      `This is great, thanks for the update.`,
      `Sounds like a plan. I'll be in touch.`,
    ];

    const opening = this.pick(replyOpenings);
    const middle = this.pick(replyMiddles);
    const closing = this.pick(this.closings);
    const signature = this.pick(this.signatures);
    const name = senderName || 'the team';

    return `${opening}\n\n${middle}\n\n${closing}\n\n${signature}\n${name}`;
  }

  // ============================================
  // GENERATE FULL EMAIL CONTENT
  // ============================================
  static generate(senderName?: string): GeneratedContent {
    const subject = this.generateSubject();
    const body = this.generateBody(senderName);
    const html = `<div style="font-family: Arial, sans-serif; font-size: 14px; line-height: 1.6; color: #333;">${body.replace(/\n/g, '<br>')}</div>`;
    return { subject, body, html };
  }

  // ============================================
  // GENERATE REPLY CONTENT
  // ============================================
  static generateReply(originalSubject: string, senderName?: string): GeneratedContent {
    const subject = originalSubject.startsWith('Re:') ? originalSubject : `Re: ${originalSubject}`;
    const body = this.generateReplyBody(originalSubject, senderName);
    const html = `<div style="font-family: Arial, sans-serif; font-size: 14px; line-height: 1.6; color: #333;">${body.replace(/\n/g, '<br>')}</div>`;
    return { subject, body, html };
  }
}
