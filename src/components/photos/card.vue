<script setup lang="ts">
import { PhotoItem } from '@/types/photos';
import { usePhotosStore } from '@/store/photos.store';

interface Props {
  photo: PhotoItem;
  selectedTags?: string[];
}
const props = defineProps<Props>();

const selected = computed<string[]>(() => props.selectedTags ?? []);
const dialogOpen = ref(false);
const openDialog = () => (dialogOpen.value = true);
const closeDialog = () => (dialogOpen.value = false);

const editedPhoto = ref<PhotoItem>(useCloneDeep(props.photo));

// deep compare
const isPhotoEdited = computed<boolean>(
  () => JSON.stringify(editedPhoto.value) !== JSON.stringify(props.photo),
);

const addingTag = ref(false);
const tagInput = ref('');

const toggleAddingTag = () => (addingTag.value = !addingTag.value);

const addTag = () => {
  if (tagInput.value) {
    editedPhoto.value.tags.push(tagInput.value);
    tagInput.value = '';
  }
  addingTag.value = false;
};

const removeTag = (tag: string) => {
  const index = editedPhoto.value.tags.indexOf(tag);
  if (index > -1) {
    editedPhoto.value.tags.splice(index, 1);
  }
};

const { updatePhotoData, getPhotos } = usePhotosStore();

const savePhoto = () => {
  updatePhotoData(editedPhoto.value);
  closeDialog();
  getPhotos();
};
</script>

<template>
  <v-card variant="flat" @click="openDialog">
    <v-img
      :src="photo.url"
      cover
      :aspect-ratio="photo.width / photo.height"
      class="align-end"
    >
      <v-card-actions v-if="selected.length" class="chip-group">
        <v-chip-group v-model="selected" color="primary" variant="flat">
          <v-chip
            v-for="tag in photo.tags"
            :key="tag"
            :value="tag"
            label
            :theme="selected.includes(tag) ? 'primary' : 'dark'"
            class="chip"
          >
            {{ tag }}
          </v-chip>
        </v-chip-group>
      </v-card-actions>
    </v-img>
  </v-card>
  <v-dialog
    v-model="dialogOpen"
    :max-width="(photo.width / photo.height) * 1000"
  >
    <v-card>
      <v-img :src="photo.url" :aspect-ratio="photo.width / photo.height">
      </v-img>

      <v-card-text>
        <div>Tags:</div>
        <v-chip-group v-model="selected" color="primary">
          <v-chip
            v-for="tag in editedPhoto.tags"
            :key="tag"
            :value="tag"
            label
            closable
            class="chip"
            close-icon="fas fa-close"
            @click:close="removeTag(tag)"
          >
            {{ tag }}
          </v-chip>
          <v-chip :value="null" label class="chip" color="primary">
            <v-icon icon="fas fa-plus" @click="toggleAddingTag"></v-icon>
          </v-chip>
          <v-text-field
            v-model="tagInput"
            dense
            hide-details
            @keydown.enter="addTag"
            @blur="addingTag = false"
            v-show="addingTag"
          />
        </v-chip-group>
      </v-card-text>
      <v-card-actions
        ><div class="buttons">
          <v-btn
            v-if="isPhotoEdited"
            color="primary"
            variant="outlined"
            @click="savePhoto"
            :text="$t('Save')"
          />
          <v-btn
            color="primary"
            variant="outlined"
            @click="closeDialog"
            :text="$t('Delete')"
          />
          <v-btn
            color="primary"
            variant="outlined"
            @click="closeDialog"
            :text="$t('Close')"
          />
        </div>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style scoped lang="scss">
.chip-group {
  background: linear-gradient(to bottom, rgba(0, 0, 0, 0), rgba(0, 0, 0, 0.3));
}
.chip {
  text-transform: capitalize;
}
.buttons {
  margin: rem(8);
  margin-left: auto;
}
</style>
