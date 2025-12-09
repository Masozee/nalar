from rest_framework.pagination import CursorPagination, PageNumberPagination
from rest_framework.response import Response
from math import ceil


class DefaultCursorPagination(CursorPagination):
    """Default cursor pagination using created_at field."""

    page_size = 20
    ordering = '-created_at'
    cursor_query_param = 'cursor'


class DefaultPagePagination(PageNumberPagination):
    """Default page number pagination with pageCount for frontend."""

    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 100

    def get_paginated_response(self, data):
        """Return paginated response with pageCount field for TanStack Table."""
        return Response({
            'count': self.page.paginator.count,
            'next': self.get_next_link(),
            'previous': self.get_previous_link(),
            'results': data,
            'pageCount': ceil(self.page.paginator.count / self.page_size) if self.page_size else 1,
        })
