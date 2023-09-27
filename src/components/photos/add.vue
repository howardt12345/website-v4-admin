<script setup lang="ts">
import { usePhotosStore } from '@/store/photos.store';

const images = ref<File[]>([]);

watch(
  () => images,
  (newValue) => {
    console.log(newValue);
  },
);

const onFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const files = target.files as FileList;
  if (files.length > 0) {
    images.value = Array.from(files);
  }
};

const imageUrl = computed(() => {
  return URL.createObjectURL(images.value[0]);
});

const imageWidth = computed(() => {
  if (images.value.length) {
    const image = new Image();
    image.src = imageUrl.value;
    return image.width;
  }
  return 0;
});

const imageHeight = computed(() => {
  if (images.value.length) {
    const image = new Image();
    image.src = imageUrl.value;
    return image.height;
  }
  return 0;
});

const showDialog = ref(false);
const openDialog = () => (showDialog.value = true);

const tags = ref<string[]>([]);
const addTag = () => {
  if (tagInput.value) {
    tags.value.push(tagInput.value);
    tagInput.value = '';
  }
  addingTag.value = false;
};
const removeTag = (tag: string) => {
  const index = tags.value.indexOf(tag);
  if (index > -1) {
    tags.value.splice(index, 1);
  }
};
const addingTag = ref(false);
const tagInput = ref('');
const toggleAddingTag = () => (addingTag.value = !addingTag.value);

const category = ref('');

const { uploadPhoto, getPhotos } = usePhotosStore();

const addPhoto = () => {
  uploadPhoto({
    file: images.value[0],
    category: category.value,
    tags: tags.value,
    width: imageWidth.value,
    height: imageHeight.value,
  }).then(() => {
    images.value = [];
    category.value = '';
    tags.value = [];
    showDialog.value = false;
    getPhotos();
  });
};
</script>

<template>
  <v-btn
    class="fab-button"
    :text="$t('Add Photo')"
    prepend-icon="fas fa-add"
    variant="elevated"
    elevation="2"
    @click="openDialog"
  >
  </v-btn>
  <v-dialog v-model="showDialog" width="1000">
    <v-card>
      <v-card-title>
        <span class="headline">Add Photo</span>
      </v-card-title>

      <v-card-text>
        <v-img v-if="images.length" :src="imageUrl"> </v-img>
      </v-card-text>

      <v-card-actions class="dialog-actions">
        <input type="file" accept="image/*" @change="onFileChange" />
        <v-text-field
          v-model="category"
          class="dialog-input"
          dense
          hide-details
          variant="outlined"
          label="Category"
        />

        <v-chip-group>
          <v-chip
            v-for="tag in tags"
            :key="tag"
            :value="tag"
            closable
            close-icon="fas fa-close"
            @click:close="removeTag(tag)"
            >{{ tag }}</v-chip
          >

          <v-chip :value="null" label class="chip" color="primary">
            <v-icon icon="fas fa-plus" @click="toggleAddingTag"></v-icon>
          </v-chip>
          <v-text-field
            v-show="addingTag"
            v-model="tagInput"
            class="dialog-input"
            dense
            hide-details
            variant="outlined"
            @keydown.enter="addTag"
            @blur="addingTag = false"
          />
        </v-chip-group>
        <v-btn variant="outlined" color="primary" @click="addPhoto">Add</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style scoped lang="scss">
.fab-button {
  position: fixed;
  bottom: rem(16);
  right: rem(16);
  z-index: 100;
}

.dialog {
  &-input {
    width: 100%;
  }

  &-actions {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    padding: rem(16);
    gap: rem(16);
  }
}
</style>
