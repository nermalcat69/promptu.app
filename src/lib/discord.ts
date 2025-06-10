interface DiscordEmbed {
  title: string;
  description: string;
  color: number;
  fields?: {
    name: string;
    value: string;
    inline?: boolean;
  }[];
  timestamp?: string;
  footer?: {
    text: string;
  };
  thumbnail?: {
    url: string;
  };
}

interface DiscordWebhookPayload {
  embeds: DiscordEmbed[];
}

// Generic function to send Discord webhook
async function sendDiscordWebhook(webhookUrl: string, payload: DiscordWebhookPayload) {
  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Discord webhook failed: ${response.status} ${response.statusText}`);
    }

    console.log('Discord notification sent successfully');
  } catch (error) {
    console.error('Failed to send Discord webhook:', error);
    throw error;
  }
}

export async function sendRegistrationNotification(user: {
  id: string;
  name: string;
  email: string;
  username: string;
  image?: string | null;
}, totalRegistrations: number) {
  if (!process.env.DISCORD_WEBHOOK_REGISTRATIONS) {
    console.log('Discord registration webhook not configured, skipping notification');
    return;
  }

  const embed: DiscordEmbed = {
    title: "🎉 New User Registration",
    description: `A new user has completed their profile setup on Promptu!\n\n**Total Registrations: ${totalRegistrations} users** 📊\n\n👤 **Profile:** ${process.env.NEXT_PUBLIC_APP_URL}/profile/${user.username}`,
    color: 0x22c55e, // Green color
    fields: [
      {
        name: "👤 Name",
        value: user.name,
        inline: true,
      },
      {
        name: "🔗 Username",
        value: `@${user.username}`,
        inline: true,
      },
      {
        name: "📧 Email",
        value: user.email,
        inline: true,
      },
      {
        name: "📈 Registration #",
        value: `#${totalRegistrations}`,
        inline: true,
      },
      {
        name: "📅 Joined",
        value: new Date().toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }),
        inline: true,
      },
    ],
    timestamp: new Date().toISOString(),
    footer: {
      text: "Promptu Registration System",
    },
  };

  const payload: DiscordWebhookPayload = {
    embeds: [embed],
  };

  await sendDiscordWebhook(process.env.DISCORD_WEBHOOK_REGISTRATIONS!, payload);
}

export async function sendFeedbackNotification(feedback: {
  type: string;
  message: string;
  userEmail?: string;
}) {
  if (!process.env.DISCORD_FEEDBACK_WEBHOOK_URL) {
    console.log('Discord feedback webhook not configured, skipping notification');
    return;
  }

  const embed: DiscordEmbed = {
    title: "📝 New Feedback",
    description: feedback.message,
    color: 0x3b82f6, // Blue color
    fields: [
      {
        name: "Type",
        value: feedback.type,
        inline: true,
      },
      ...(feedback.userEmail ? [{
        name: "Email",
        value: feedback.userEmail,
        inline: true,
      }] : []),
    ],
    timestamp: new Date().toISOString(),
    footer: {
      text: "Promptu Feedback System",
    },
  };

  const payload: DiscordWebhookPayload = {
    embeds: [embed],
  };

  await sendDiscordWebhook(process.env.DISCORD_FEEDBACK_WEBHOOK_URL, payload);
}

export async function sendFeatureRequestNotification(feature: {
  title: string;
  description: string;
  userEmail?: string;
}) {
  if (!process.env.DISCORD_FEATURE_WEBHOOK_URL) {
    console.log('Discord feature webhook not configured, skipping notification');
    return;
  }

  const embed: DiscordEmbed = {
    title: "💡 New Feature Request",
    description: feature.description,
    color: 0x8b5cf6, // Purple color
    fields: [
      {
        name: "Feature Title",
        value: feature.title,
        inline: false,
      },
      ...(feature.userEmail ? [{
        name: "Requested by",
        value: feature.userEmail,
        inline: true,
      }] : []),
    ],
    timestamp: new Date().toISOString(),
    footer: {
      text: "Promptu Feature Requests",
    },
  };

  const payload: DiscordWebhookPayload = {
    embeds: [embed],
  };

  await sendDiscordWebhook(process.env.DISCORD_FEATURE_WEBHOOK_URL, payload);
}

// Send prompt event notification
export async function sendPromptNotification(
  event: 'published' | 'deleted' | 'edited',
  prompt: {
    id: string;
    title: string;
    description?: string;
    category: string;
    tags?: string[];
    isPublic: boolean;
  },
  user: {
    id: string;
    name: string;
    username: string;
    email: string;
    image?: string | null;
  }
) {
  if (!process.env.DISCORD_WEBHOOK_PROMPTS) {
    console.log('Discord prompt webhook not configured, skipping notification');
    return;
  }

  const eventEmojis = {
    published: '🚀',
    deleted: '🗑️',
    edited: '✏️'
  };

  const eventColors = {
    published: 0x22c55e, // Green
    deleted: 0xef4444,   // Red
    edited: 0xf59e0b     // Orange
  };

  const eventTitles = {
    published: 'New Prompt Published',
    deleted: 'Prompt Deleted',
    edited: 'Prompt Updated'
  };

  const embed: DiscordEmbed = {
    title: `${eventEmojis[event]} ${eventTitles[event]}`,
    description: prompt.description || 'No description provided',
    color: eventColors[event],
    fields: [
      {
        name: "📝 Prompt Title",
        value: prompt.title,
        inline: false,
      },
      {
        name: "👤 Author",
        value: `${user.name} (@${user.username})`,
        inline: true,
      },
      {
        name: "📧 Author Email",
        value: user.email,
        inline: true,
      },
      {
        name: "📂 Category",
        value: prompt.category,
        inline: true,
      },
      {
        name: "🌐 Visibility",
        value: prompt.isPublic ? "Public" : "Private",
        inline: true,
      },
      {
        name: "🔗 Prompt URL",
        value: `${process.env.NEXT_PUBLIC_APP_URL}/prompts/${prompt.id}`,
        inline: false,
      },
      {
        name: "👤 Author Profile",
        value: `${process.env.NEXT_PUBLIC_APP_URL}/profile/${user.username}`,
        inline: false,
      },
    ],
    timestamp: new Date().toISOString(),
    footer: {
      text: "Promptu Prompt System",
    },
  };

  // Add tags field if available
  if (prompt.tags && prompt.tags.length > 0) {
    embed.fields!.splice(5, 0, {
      name: "🏷️ Tags",
      value: prompt.tags.map(tag => `\`${tag}\``).join(', '),
      inline: false,
    });
  }

  // Add thumbnail if user has image
  if (user.image) {
    embed.thumbnail = {
      url: user.image,
    };
  }

  const payload: DiscordWebhookPayload = {
    embeds: [embed],
  };

  await sendDiscordWebhook(process.env.DISCORD_WEBHOOK_PROMPTS!, payload);
} 