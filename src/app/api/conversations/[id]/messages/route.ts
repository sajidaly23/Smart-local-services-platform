import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import { Conversation, Message, Notification } from "@/models";
import { getUserFromRequest } from "@/lib/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    await connectToDatabase();

    const conversation = await Conversation.findById(id);
    if (!conversation) {
      return NextResponse.json({ success: false, error: "Conversation not found" }, { status: 404 });
    }

    // Verify user is a participant or admin
    const isParticipant = conversation.participants.some(
      (p) => p.toString() === user.id
    );
    if (!isParticipant && user.role !== "admin") {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    const messages = await Message.find({ conversation: id })
      .populate("sender", "name profileImage role")
      .sort({ createdAt: 1 })
      .lean();

    // Mark unread messages sent by others as read
    await Message.updateMany(
      { conversation: id, sender: { $ne: user.id }, isRead: false },
      { $set: { isRead: true } }
    );

    return NextResponse.json({ success: true, messages });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const { message, messageType = "text" } = await req.json();

    if (!message || !message.trim()) {
      return NextResponse.json({ success: false, error: "Message content cannot be empty" }, { status: 400 });
    }

    await connectToDatabase();

    const conversation = await Conversation.findById(id);
    if (!conversation) {
      return NextResponse.json({ success: false, error: "Conversation not found" }, { status: 404 });
    }

    const isParticipant = conversation.participants.some(
      (p) => p.toString() === user.id
    );
    if (!isParticipant) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    // Create the message
    const newMessage = await Message.create({
      conversation: id,
      sender: user.id,
      message: message.trim(),
      messageType,
      isRead: false,
    });

    // Update conversation lastMessage & lastMessageAt
    conversation.lastMessage = message.trim();
    conversation.lastMessageAt = new Date();
    await conversation.save();

    // Find the other participant and trigger notification
    const recipientId = conversation.participants.find(
      (p) => p.toString() !== user.id
    );

    if (recipientId) {
      await Notification.create({
        recipient: recipientId,
        title: `New Message from ${user.name}`,
        message: message.length > 60 ? `${message.substring(0, 60)}...` : message,
        type: "message",
        relatedId: conversation._id.toString(),
        link: `/dashboard/${user.role === "provider" ? "customer" : "provider"}/messages`,
      });
    }

    const populated = await Message.findById(newMessage._id).populate(
      "sender",
      "name profileImage role"
    );

    return NextResponse.json({ success: true, message: populated }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

