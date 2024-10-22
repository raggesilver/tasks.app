<script setup lang="ts">
import { toast } from "vue-sonner";
import { formatFileSize } from "~/lib/utils";
import type { Attachment } from "~~/server/db/schema";

const props = defineProps<{ attachment: Attachment }>();

const canDelete = ref(true);

const { mutateAsync: deleteAttachment, isPending } =
  useDeleteTaskAttachmentMutation();

const onCopyLink = () => {
  const baseURL = window.location.origin;
  const url = new URL(`/api/attachment/${props.attachment.id}`, baseURL);
  navigator.clipboard.writeText(url.toString());
};

const onDeleteAttachment = async () => {
  if (isPending.value) return;

  return deleteAttachment(props.attachment)
    .then(() => {
      toast.success("Attachment deleted successfully");
    })
    .catch((e) => {
      toast.error("Failed to delete attachment");
      console.error(e);
    });
};

const fileType = computed(() => {
  if (props.attachment.mimeType.startsWith("image/")) return "image";
  if (props.attachment.mimeType.startsWith("video/")) return "video";
  if (props.attachment.mimeType.startsWith("audio/")) return "audio";
  if (props.attachment.mimeType.startsWith("application/pdf")) return "pdf";
  // Compressed files
  if (
    [
      "application/zip",
      "application/x-zip-compressed",
      "application/x-rar-compressed",
      "application/x-tar",
      "application/x-tar-compressed",
      "application/x-gzip",
      "application/gzip",
      "application/x-bzip2",
      "application/x-7z-compressed",
    ].includes(props.attachment.mimeType)
  ) {
    return "compressed";
  }
  return "other";
});

const codeIconsByExtension = {
  html: "vscode-icons:file-type-html",
  css: "vscode-icons:file-type-css",
  js: "vscode-icons:file-type-js",
  json: "vscode-icons:file-type-json",
  sh: "vscode-icons:file-type-shell",
  py: "vscode-icons:file-type-python",
  c: "vscode-icons:file-type-c",
  h: "vscode-icons:file-type-cheader",
  java: "vscode-icons:file-type-java",
  cs: "vscode-icons:file-type-csharp",
  go: "vscode-icons:file-type-go",
  rs: "vscode-icons:file-type-rust",
  ts: "vscode-icons:file-type-typescript",
  sql: "vscode-icons:file-type-sql",
  txt: "vscode-icons:file-type-text",
};

const iconForFileType = computed(() => {
  switch (fileType.value) {
    case "image":
      return null;
    case "video":
      return null;
    case "audio":
      return "vscode-icons:file-type-audio";
    case "pdf":
      return "vscode-icons:file-type-pdf2";
    case "compressed":
      return "lucide:file-archive";
    case "other": {
      const extension = props.attachment.name.split(".").pop();
      if (extension && extension in codeIconsByExtension) {
        return codeIconsByExtension[
          extension as keyof typeof codeIconsByExtension
        ];
      }
      return null;
    }
    default:
      return null;
  }
});
</script>

<template>
  <div class="preview flex-1">
    <!-- Image preview -->
    <img
      v-if="attachment.mimeType.startsWith('image/')"
      :src="`/api/attachment/${attachment.id}`"
      class="w-full h-full object-cover"
    />
    <!-- TODO: Video preview -->
    <!-- Other file types -->
    <div
      v-else
      class="h-full flex flex-col items-center justify-center gap-2 p-4 text-center"
    >
      <Icon
        v-if="iconForFileType"
        :name="iconForFileType"
        class="w-12 h-12 text-muted-foreground"
      />
      <p class="text-sm font-semibold line-clamp-2 whitespace-normal break-all">
        {{ attachment.name }}
      </p>
    </div>

    <div class="overlay text-xs">
      <EasyTooltip :tooltip="attachment.name">
        <p class="line-clamp-1 whitespace-normal break-all">
          {{ attachment.name }}
        </p>
      </EasyTooltip>
      <p class="text-muted-foreground">
        {{ attachment.mimeType }} — {{ formatFileSize(attachment.size) }}
      </p>
      <p class="text-muted-foreground">
        Added at <SsrTime :time="attachment.createdAt" type="datetime" />.
      </p>
      <div class="tools">
        <EasyTooltip tooltip="Copy link">
          <Button size="micro" variant="outline" @click="onCopyLink">
            <Icon name="lucide:link" class="w-3 h-3" />
          </Button>
        </EasyTooltip>
        <EasyTooltip tooltip="Download file">
          <Button size="micro" variant="outline" as-child>
            <a
              :href="`/api/attachment/${attachment.id}?download`"
              :download="attachment.name"
              target="_blank"
            >
              <Icon name="lucide:download" class="w-3 h-3" />
            </a>
          </Button>
        </EasyTooltip>
        <EasyTooltip tooltip="Open in new tab">
          <Button size="micro" variant="outline" as-child>
            <NuxtLink
              :to="`/api/attachment/${attachment.id}`"
              external
              target="_blank"
            >
              <Icon name="lucide:external-link" class="w-3 h-3" />
            </NuxtLink>
          </Button>
        </EasyTooltip>
        <EasyTooltip tooltip="Delete attachment">
          <Button
            v-if="canDelete"
            size="micro"
            variant="destructive"
            :disabled="isPending"
            @click="onDeleteAttachment"
          >
            <Icon
              v-if="isPending"
              name="lucide:loader"
              class="w-3 h-3 animate-spin"
            />
            <Icon v-else name="lucide:trash" class="w-3 h-3" />
          </Button>
        </EasyTooltip>
      </div>
    </div>
  </div>
</template>

<style scoped>
.overlay {
  @apply absolute bottom-0 left-0 w-full bg-background/60 backdrop-blur-xl p-2 border-t space-y-2 translate-y-full rounded-t-lg;

  /* translate-y-[calc(100%-40px)] */

  --overlay-translate-amount: 100%;
  transform: translateY(var(--overlay-translate-amount));
  transition-duration: 0.25s;

  .tools {
    @apply grid grid-flow-col auto-cols-min gap-1 justify-end;
  }

  /* &:not(:hover):not(:focus-within) .tools { */
  /*   @apply hidden; */
  /* } */

  & > p:first-child {
    @apply font-semibold mb-2;
    line-height: calc(40px - 1rem + 1px);
  }
}

.preview {
  @apply w-[200px] h-[200px] rounded-lg border relative overflow-hidden;

  &:hover .overlay {
    --overlay-translate-amount: calc(100% - 40px);
  }
}

.preview .overlay:hover,
.preview .overlay:focus-within {
  @apply bg-background backdrop-none;
  --overlay-translate-amount: 0;
}
</style>
