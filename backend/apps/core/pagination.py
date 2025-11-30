from rest_framework.pagination import CursorPagination, PageNumberPagination


class DefaultCursorPagination(CursorPagination):
    """Default cursor pagination using created_at field."""

    page_size = 20
    ordering = '-created_at'
    cursor_query_param = 'cursor'


class DefaultPagePagination(PageNumberPagination):
    """Default page number pagination."""

    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 100
