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

const imageUrls = computed(() => {
  return images.value.map((image) => URL.createObjectURL(image));
});

const showDialog = ref(false);
const openDialog = () => (showDialog.value = true);

watch(
  () => showDialog.value,
  (newValue) => {
    if (!newValue) {
      images.value = [];
      category.value = '';
      tags.value = [];
    }
  },
);

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
const uploading = ref(false);

const addPhoto = async () => {
  uploading.value = true;
  await uploadPhoto({
    files: images.value,
    category: category.value,
    tags: tags.value,
  });

  uploading.value = false;
  images.value = [];
  category.value = '';
  tags.value = [];
  showDialog.value = false;
  getPhotos();
};
</script>

<template>
  <v-btn
    class="fab-button"
    :text="$t('Add Photos')"
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

      <div v-if="!uploading">
        <v-card-text>
          <v-carousel v-if="images.length" hide-delimiters>
            <v-carousel-item v-for="url in imageUrls" :key="url">
              <v-img :src="url"></v-img>
            </v-carousel-item>
          </v-carousel>
        </v-card-text>

        <v-card-actions class="dialog-actions">
          <input type="file" accept="image/*" multiple @change="onFileChange" />
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
          <v-btn variant="outlined" color="primary" @click="addPhoto"
            >Add</v-btn
          >
        </v-card-actions>
      </div>
      <div v-else>
        <v-card-text>
          <v-progress-linear indeterminate color="primary"></v-progress-linear>
        </v-card-text>
      </div>
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
