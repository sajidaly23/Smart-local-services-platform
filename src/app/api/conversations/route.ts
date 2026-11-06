import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import { Conversation, Message, User } from "@/models";
import { getUserFromRequest } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const user = getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    const conversations = await Conversation.find({
      participants: user.id,
    })
      .populate("participants", "name email phone profileImage role")
      .populate("booking", "bookingReference status")
      .sort({ lastMessageAt: -1 })
      .lean();

    return NextResponse.json({ success: true, conversations });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { recipientId, bookingId, initialMessage } = await req.json();
    if (!recipientId) {
      return NextResponse.json(
        { success: false, error: "Recipient ID is required" },
        { status: 400 }
      );
    }

    if (recipientId === user.id) {
      return NextResponse.json(
        { success: false, error: "Cannot start a conversation with yourself" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Check if conversation already exists between these 2 users
    let conversation = await Conversation.findOne({
      participants: { $all: [user.id, recipientId], $size: 2 },
    });

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [user.id, recipientId],
        booking: bookingId || undefined,
        lastMessage: initialMessage || "Started a conversation",
        lastMessageAt: new Date(),
      });

      if (initialMessage) {
        await Message.create({
          conversation: conversation._id,
          sender: user.id,
          message: initialMessage,
          messageType: "text",
        });
      }
    }

    const populated = await Conversation.findById(conversation._id)
      .populate("participants", "name email phone profileImage role")
      .populate("booking");

    return NextResponse.json({ success: true, conversation: populated });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

