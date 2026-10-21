import { useEffect, useRef, useState } from "react";
import { FlatList, KeyboardAvoidingView, Platform, Pressable, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { ArrowLeft, CheckCheck, Paperclip, Phone, SendHorizontal } from "lucide-react-native";
import type { ChatMessage } from "@/types/domain";
import type { AvatarKey } from "@/mocks/assets";
import { quickReplies } from "@/mocks/chat";
import { useChatStore } from "@/stores/useChatStore";
import { formatTime } from "@/utils/date";
import { toast } from "@/lib/toast";
import { colors, radius } from "@/theme/colors";
import { fontFamily } from "@/theme/fonts";
import { AppText } from "@/components/core/AppText";
import { Avatar } from "@/components/core/Avatar";
import { IconButton } from "@/components/core/IconButton";
import { ChoiceChip } from "@/components/core/SelectionCard";

type Me = ChatMessage["from"];

/**
 * Conversa simulada (ref. 24): mensagens locais, resposta automática do outro
 * lado e indicação "a escrever…". Não há envio real nem anexos.
 */
export function ChatThread({
  threadId,
  me,
  replyAs,
  counterpart,
  onCall,
  seed = "service",
}: {
  threadId: string;
  me: Me;
  replyAs: Me;
  counterpart: { name: string; initials: string; photo?: AvatarKey; subtitle?: string };
  onCall?: () => void;
  seed?: "service" | "support";
}) {
  const messages = useChatStore((s) => s.threads[threadId] ?? []);
  const typing = useChatStore((s) => !!s.typing[threadId]);
  const [text, setText] = useState("");
  const list = useRef<FlatList<ChatMessage>>(null);

  useEffect(() => {
    useChatStore.getState().ensureThread(threadId, seed);
  }, [threadId, seed]);
  useEffect(() => {
    useChatStore.getState().markRead(threadId, me);
    setTimeout(() => list.current?.scrollToEnd({ animated: true }), 50);
  }, [messages.length, threadId, me]);

  const send = (value = text) => {
    if (!value.trim()) return;
    useChatStore.getState().send(threadId, me, value, replyAs);
    setText("");
  };

  return (
    <SafeAreaView edges={["top", "bottom"]} style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 12, paddingVertical: 8 }}>
        <IconButton label="Voltar" icon={<ArrowLeft size={24} color={colors.ink} />} onPress={() => router.back()} />
        <Avatar name={counterpart.name} initials={counterpart.initials} photo={counterpart.photo} size={52} online />
        <View style={{ flex: 1 }}>
          <AppText variant="h3">{counterpart.name}</AppText>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: colors.accent }} />
            <AppText variant="caption" color={colors.muted}>
              {typing ? "a escrever…" : (counterpart.subtitle ?? "Online")}
            </AppText>
          </View>
        </View>
        {onCall ? <IconButton variant="soft" label={`Ligar a ${counterpart.name}`} icon={<Phone size={22} color={colors.primary} />} onPress={onCall} /> : null}
      </View>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <FlatList
          ref={list}
          data={messages}
          keyExtractor={(m) => m.id}
          contentContainerStyle={{ padding: 16, gap: 12 }}
          renderItem={({ item }) => {
            const mine = item.from === me;
            return (
              <View
                accessible
                accessibilityLabel={`${mine ? "Tu" : counterpart.name}, ${formatTime(item.at)}: ${item.text}`}
                style={{
                  alignSelf: mine ? "flex-end" : "flex-start",
                  maxWidth: "80%",
                  backgroundColor: mine ? colors.primary : "#ECEFED",
                  borderRadius: radius.lg,
                  borderBottomRightRadius: mine ? 4 : radius.lg,
                  borderBottomLeftRadius: mine ? radius.lg : 4,
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  gap: 6,
                }}
              >
                <AppText variant="body" color={mine ? colors.white : colors.ink} style={{ fontSize: 16 }}>
                  {item.text}
                </AppText>
                <View style={{ flexDirection: "row", alignSelf: mine ? "flex-end" : "flex-start", alignItems: "center", gap: 4 }}>
                  <AppText variant="tiny" color={mine ? "#D3EFDF" : colors.muted}>
                    {formatTime(item.at)}
                  </AppText>
                  {mine ? <CheckCheck size={14} color="#D3EFDF" /> : null}
                </View>
              </View>
            );
          }}
          ListFooterComponent={
            typing ? (
              <AppText variant="caption" color={colors.muted} accessibilityLiveRegion="polite">
                {counterpart.name.split(" ")[0]} está a escrever…
              </AppText>
            ) : null
          }
        />
        <View style={{ flexDirection: "row", gap: 8, paddingHorizontal: 16, paddingBottom: 8, flexWrap: "wrap" }}>
          {quickReplies[me].map((q) => (
            <ChoiceChip key={q} label={q} selected={false} onPress={() => send(q)} />
          ))}
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 12, paddingVertical: 8, borderTopWidth: 1, borderColor: colors.border, backgroundColor: colors.card }}>
          <IconButton label="Anexar ficheiro" icon={<Paperclip size={22} color={colors.muted} />} onPress={() => toast.info({ title: "Anexos indisponíveis", message: "O envio de ficheiros chega na próxima fase." })} />
          <TextInput
            value={text}
            onChangeText={setText}
            placeholder="Escrever mensagem"
            placeholderTextColor={colors.subtle}
            accessibilityLabel="Escrever mensagem"
            onSubmitEditing={() => send()}
            returnKeyType="send"
            style={{ flex: 1, minHeight: 48, borderRadius: 24, backgroundColor: "#F1F4F2", paddingHorizontal: 18, fontFamily: fontFamily.medium, fontSize: 16, color: colors.ink }}
          />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Enviar mensagem"
            accessibilityState={{ disabled: !text.trim() }}
            onPress={() => send()}
            style={({ pressed }) => ({ width: 50, height: 50, borderRadius: 25, backgroundColor: text.trim() ? colors.primary : colors.borderStrong, alignItems: "center", justifyContent: "center", opacity: pressed ? 0.8 : 1 })}
          >
            <SendHorizontal size={22} color={colors.white} fill={colors.white} />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
