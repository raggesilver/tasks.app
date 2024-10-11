<script setup lang="ts">
const hasAgreed = useCookie<boolean>("__agree_not_prod_ready", {
  decode: (v) => v === "true",
  encode: (v) => v.toString(),
  maxAge: 60 * 60 * 24 * 365,
  default: () => false,
});

const onClickUnderstood = () => {
  hasAgreed.value = true;
};
</script>

<template>
  <div
    v-if="!hasAgreed"
    class="w-full p-4 bg-destructive text-destructive-foreground"
  >
    <div class="container flex gap-4 items-center">
      <p class="flex-grow">
        Tasks.app is under active development. Most features listed on the
        landing/pricing page have not been (fully) developed yet. Furthermore,
        we may reset the database and storage at any point.
      </p>

      <AlertDialog>
        <AlertDialogTrigger as-child>
          <Button>I understand</Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              <!-- state that we may reset the database and storage at any point and that by clicking continue the user consentes to this and the fact that some features have not been (fully) developed yet -->

              By clicking "Continue" you agree to the fact that Tasks.app is
              under active development and that most features listed on the
              landing/pricing page have not been (fully) developed yet.
              Furthermore, you agree that we may reset the database and storage
              at any point, which may result in loss of data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction @click="onClickUnderstood"
              >Continue</AlertDialogAction
            >
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  </div>
</template>
