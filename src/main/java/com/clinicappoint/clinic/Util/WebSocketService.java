package com.clinicappoint.clinic.Util;

import org.springframework.stereotype.Component;
import jakarta.websocket.*;
import jakarta.websocket.server.PathParam;
import jakarta.websocket.server.ServerEndpoint;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

@ServerEndpoint(value = "/transfer/{username}")
@Component
public class WebSocketService {

	// 在线用户数量
	private static final AtomicInteger COUNT = new AtomicInteger();

	// 在线用户会话
	private static final ConcurrentHashMap<String, Session> SESSIONS = new ConcurrentHashMap<>();

	public WebSocketService() {
		System.out.println("新的连接。。。");
	}

	// 添加会话
	private void addSession(String userId, Session session) {
		SESSIONS.put(userId.trim(), session);
		COUNT.incrementAndGet();
		System.out.println(userId + " 上线了，当前在线人数：" + COUNT.get());
	}

	// 移除会话
	private void removeSession(String userId) {
		SESSIONS.remove(userId.trim());
		COUNT.decrementAndGet();
		System.out.println(userId + " 下线了，当前在线人数：" + COUNT.get());
	}

	// 获取会话
	private Session getSession(String userId) {
		return SESSIONS.get(userId.trim());
	}

	// 向指定用户发送消息
	public void sendMessage(Session toSession, String message) {
		if (toSession != null) {
			try {
				toSession.getBasicRemote().sendText(message);
			} catch (IOException e) {
				System.out.println("发送消息失败：" + e.getMessage());
				e.printStackTrace();
			}
		} else {
			System.out.println("目标用户不在线");
		}
	}

	// 广播信令给目标用户
	private void broadcastMessage(String fromUser, String targetUser, String message) throws Exception {
		Session targetSession = getSession(targetUser);
		if (targetSession != null) {
			sendMessage(targetSession, message);
		} else {
			// 构造 bye 消息
			SignalMessage byeMessage = new SignalMessage();
			byeMessage.setType("bye");
			byeMessage.setFromUser(fromUser);
			byeMessage.setTargetUser(targetUser);

			// 将 bye 消息转换为 JSON
			Session fromSession = getSession(fromUser);
			ObjectMapper mapper = new ObjectMapper();
			String byeMessageJson = mapper.writeValueAsString(byeMessage);
			sendMessage(fromSession,byeMessageJson);
			System.out.println("目标用户 " + targetUser + " 不在线");
		}
	}

	@OnOpen
	public void onOpen(Session session, @PathParam("username") String userId) {
		if (getSession(userId) != null) {
			System.out.println("用户 " + userId + " 已经上线过了");
			return;
		}
		addSession(userId, session);
	}

	@OnMessage
	public void onMessage(String message, @PathParam("username") String userId) {
		System.out.println("收到消息: " + message);
		try {
			// 解析消息内容
			SignalMessage signalMessage = SignalMessage.fromJson(message);

			switch (signalMessage.getType()) {
				case "offer":
				case "answer":
				case "candidate":
					// 转发信令消息给目标用户
					if (signalMessage.getTargetUser() != null) {
						broadcastMessage(signalMessage.fromUser, signalMessage.getTargetUser(), message);
					} else {
						System.out.println("消息缺少 targetUser 字段");
					}
					break;

				case "bye":
					// 挂断信令
					if (signalMessage.getTargetUser() != null) {
						broadcastMessage(signalMessage.fromUser, signalMessage.getTargetUser(), message);
						System.out.println("用户 " + userId + " 挂断了通话");
					} else {
						System.out.println("消息缺少 targetUser 字段");
					}
					break;

				default:
					System.out.println("未知消息类型: " + signalMessage.getType());
			}
		} catch (Exception e) {
			e.printStackTrace();
			sendMessage(getSession(userId), "解析消息失败: " + e.getMessage());
		}
	}

	@OnClose
	public void onClose(@PathParam("username") String userId) {
		removeSession(userId);
	}

	@OnError
	public void onError(Session session, Throwable throwable) {
		System.out.println("发生错误");
		throwable.printStackTrace();
	}

	// 定义信令消息类
	// 定义信令消息类
	private static class SignalMessage {
		private String type; // 信令类型: offer, answer, candidate, bye
		private String targetUser; // 目标用户 ID
		private String fromUser; // 发送方用户 ID
		private SDP sdp; // SDP 数据
		private ICECandidate candidate; // ICE 候选者数据

		// 使用 Jackson 解析 JSON
		public static SignalMessage fromJson(String json) throws IOException {
			ObjectMapper mapper = new ObjectMapper();
			return mapper.readValue(json, SignalMessage.class);
		}

		// Getter 和 Setter 方法
		public String getType() {
			return type;
		}

		public void setType(String type) {
			this.type = type;
		}

		public String getTargetUser() {
			return targetUser;
		}

		public void setTargetUser(String targetUser) {
			this.targetUser = targetUser;
		}

		public String getFromUser() {
			return fromUser;
		}

		public void setFromUser(String fromUser) {
			this.fromUser = fromUser;
		}

		public SDP getSdp() {
			return sdp;
		}

		public void setSdp(SDP sdp) {
			this.sdp = sdp;
		}

		public ICECandidate getCandidate() {
			return candidate;
		}

		public void setCandidate(ICECandidate candidate) {
			this.candidate = candidate;
		}

		// SDP 子类
		public static class SDP {
			private String type; // SDP 类型: offer 或 answer
			private String sdp; // SDP 内容

			// Getter 和 Setter 方法
			public String getType() {
				return type;
			}

			public void setType(String type) {
				this.type = type;
			}

			public String getSdp() {
				return sdp;
			}

			public void setSdp(String sdp) {
				this.sdp = sdp;
			}
		}

		// ICECandidate 子类
		public static class ICECandidate {
			private String candidate; // ICE 候选者字符串
			private String sdpMid; // SDP 中的媒体 ID
			private Integer sdpMLineIndex; // SDP 中的媒体索引

			// Getter 和 Setter 方法
			public String getCandidate() {
				return candidate;
			}

			public void setCandidate(String candidate) {
				this.candidate = candidate;
			}

			public String getSdpMid() {
				return sdpMid;
			}

			public void setSdpMid(String sdpMid) {
				this.sdpMid = sdpMid;
			}

			public Integer getSdpMLineIndex() {
				return sdpMLineIndex;
			}

			public void setSdpMLineIndex(Integer sdpMLineIndex) {
				this.sdpMLineIndex = sdpMLineIndex;
			}
		}
	}

}
