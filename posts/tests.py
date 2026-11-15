from django.test import TestCase
from django.urls import reverse
from django.contrib.auth.models import User
from profiles.models import Profile
from .models import Post

# Create your tests here.

class PostsTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='felipe', password='felipe12345')
        self.testuser = User.objects.create_user(username='testuser', password='test12345')
        author = Profile.objects.get(user=self.user)
        self.obj = Post.objects.create(title='my first post', body='hello from felipe', author=author)

    def test_main_page_needs_login(self):
        response = self.client.get(reverse('posts:main-board'))
        self.assertRedirects(response, '/accounts/login/?next=/')

    def test_normal_user_can_log_in(self):
        response = self.client.post(reverse('login'), {
            'username': 'testuser',
            'password': 'test12345',
        })
        self.assertRedirects(response, reverse('posts:main-board'))

    def test_like_and_unlike(self):
        self.client.force_login(self.testuser)
        url = reverse('posts:like-unlike')

        response = self.client.post(url, {'pk': self.obj.pk}, HTTP_X_REQUESTED_WITH='XMLHttpRequest')
        self.assertEqual(response.json(), {'liked': True, 'count': 1})

        response = self.client.post(url, {'pk': self.obj.pk}, HTTP_X_REQUESTED_WITH='XMLHttpRequest')
        self.assertEqual(response.json(), {'liked': False, 'count': 0})

    def test_other_user_cannot_delete(self):
        self.client.force_login(self.testuser)
        url = reverse('posts:post-delete', kwargs={'pk': self.obj.pk})
        self.client.post(url, HTTP_X_REQUESTED_WITH='XMLHttpRequest')
        self.assertTrue(Post.objects.filter(pk=self.obj.pk).exists())

    def test_missing_post_goes_home(self):
        self.client.force_login(self.user)
        response = self.client.get(reverse('posts:post-detail', kwargs={'pk': 919779}))
        self.assertRedirects(response, reverse('posts:main-board'))
