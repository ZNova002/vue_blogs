import { ref, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getPostById, getRelatedPosts } from '../services/postService';
import { getCommentsByPost, createComment } from '../services/commentServices';
import DOMPurify from 'dompurify';

// Composable xử lý logic chi tiết bài viết
export default function usePostDetail() {
    const route = useRoute();
    const router = useRouter();
    const post = ref({});
    const category = ref(null);
    const tags = ref([]);
    const relatedPosts = ref([]);
    const comments = ref([]);
    const commentInfo = ref({ email: '', phone: '', message: '' });
    const error = ref(null);
    const loading = ref(false);

    const sanitizedContent = computed(() => (
        post.value.content ? DOMPurify.sanitize(post.value.content) : ''
    ));

    const formatDate = (date) => {
        if (!date) return '';
        return new Date(date).toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        });
    };

    const fetchPost = async () => {
        try {
            loading.value = true;
            error.value = null;
            const postId = route.params.id;

            // Lấy bài viết
            const postResponse = await getPostById(postId);
            if (!postResponse.success) throw new Error(postResponse.message);
            post.value = postResponse.data;

            // Lấy danh mục và tags
            category.value = postResponse.data.category || null;
            tags.value = postResponse.data.tags || [];

            // Lấy bài viết liên quan
            const relatedResponse = await getRelatedPosts(postId);
            relatedPosts.value = relatedResponse.success ? relatedResponse.data : [];

            // Lấy bình luận
            const commentsResponse = await getCommentsByPost(postId);
            comments.value = commentsResponse.success ? commentsResponse.data : [];
        } catch (err) {
            error.value = err.message || 'Không thể tải bài viết.';
        } finally {
            loading.value = false;
        }
    };

    // Gửi bình luận
    const submitComment = async () => {
        if ((!commentInfo.value.email && !commentInfo.value.phone) || !commentInfo.value.message) {
            error.value = 'Vui lòng nhập nội dung bình luận và ít nhất một trong hai: email hoặc số điện thoại.';
            return;
        }

        try {
            const postId = route.params.id;
            const commentResponse = await createComment(postId, commentInfo.value);
            if (commentResponse.success) {
                comments.value.push(commentResponse.data);
                commentInfo.value = { email: '', phone: '', message: '' };
                error.value = null;
            } else {
                error.value = commentResponse.message;
            }
        } catch (err) {
            error.value = err.message || 'Không thể gửi bình luận.';
        }
    };


    onMounted(fetchPost);
    watch(() => route.params.id, (newId) => {
        if (newId) fetchPost();
    });

    return {
        post,
        category,
        relatedPosts,
        tags,
        error,
        loading,
        comments,
        commentInfo,
        submitComment,
        sanitizedContent,
        formatDate,
        router,
    };
}
