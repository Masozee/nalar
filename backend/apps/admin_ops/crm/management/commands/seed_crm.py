"""
Seed command for CRM module.
Creates sample organizations, contacts, positions, notes, and activities.
"""
import random
from datetime import timedelta
from django.core.management.base import BaseCommand
from django.utils import timezone
from apps.users.models import User
from apps.admin_ops.crm.models import (
    Organization, Contact, JobPosition, ContactNote, ContactActivity,
    AccessLevel, OrganizationType, ContactType, ActivityType,
)


class Command(BaseCommand):
    help = 'Seed CRM data with Indonesian context'

    def handle(self, *args, **options):
        self.stdout.write('Seeding CRM data...')

        users = list(User.objects.all()[:10])
        if len(users) < 2:
            self.stdout.write(self.style.WARNING('Need at least 2 users. Run seed_hr first.'))
            return

        organizations = self.create_organizations()
        contacts = self.create_contacts(users, organizations)
        self.create_job_positions(contacts, organizations)
        self.create_contact_notes(contacts, users)
        self.create_contact_activities(contacts, users)

        self.stdout.write(self.style.SUCCESS(
            f'Created {len(organizations)} organizations, {len(contacts)} contacts, '
            f'with positions, notes, and activities'
        ))

    def create_organizations(self):
        """Create partner organizations."""
        organizations = []
        org_data = [
            # Government
            ('Kementerian BUMN', OrganizationType.GOVERNMENT, 'Government', 'https://bumn.go.id',
             'Jakarta', 'Indonesia', 'Oversees state-owned enterprises', AccessLevel.INTERNAL),
            ('Kementerian Keuangan', OrganizationType.GOVERNMENT, 'Government', 'https://kemenkeu.go.id',
             'Jakarta', 'Indonesia', 'Ministry of Finance', AccessLevel.VIP),
            ('Bank Indonesia', OrganizationType.GOVERNMENT, 'Banking', 'https://bi.go.id',
             'Jakarta', 'Indonesia', 'Central bank of Indonesia', AccessLevel.VIP),
            ('Otoritas Jasa Keuangan (OJK)', OrganizationType.GOVERNMENT, 'Financial Services', 'https://ojk.go.id',
             'Jakarta', 'Indonesia', 'Financial Services Authority', AccessLevel.RESTRICTED),
            ('Kementerian Pendidikan', OrganizationType.GOVERNMENT, 'Education', 'https://kemdikbud.go.id',
             'Jakarta', 'Indonesia', 'Ministry of Education', AccessLevel.INTERNAL),

            # Corporate
            ('PT Telkom Indonesia', OrganizationType.CORPORATE, 'Telecommunications', 'https://telkom.co.id',
             'Bandung', 'Indonesia', 'State-owned telecommunications company', AccessLevel.INTERNAL),
            ('PT Bank Mandiri', OrganizationType.CORPORATE, 'Banking', 'https://bankmandiri.co.id',
             'Jakarta', 'Indonesia', 'Largest bank in Indonesia', AccessLevel.VIP),
            ('PT Pertamina', OrganizationType.CORPORATE, 'Energy', 'https://pertamina.com',
             'Jakarta', 'Indonesia', 'National oil and gas company', AccessLevel.INTERNAL),
            ('PT PLN', OrganizationType.CORPORATE, 'Energy', 'https://pln.co.id',
             'Jakarta', 'Indonesia', 'State electricity company', AccessLevel.INTERNAL),
            ('Gojek', OrganizationType.CORPORATE, 'Technology', 'https://gojek.com',
             'Jakarta', 'Indonesia', 'Decacorn technology company', AccessLevel.INTERNAL),

            # Education
            ('Universitas Indonesia', OrganizationType.EDUCATION, 'Higher Education', 'https://ui.ac.id',
             'Depok', 'Indonesia', 'Premier public university', AccessLevel.INTERNAL),
            ('Institut Teknologi Bandung', OrganizationType.EDUCATION, 'Higher Education', 'https://itb.ac.id',
             'Bandung', 'Indonesia', 'Leading technical university', AccessLevel.INTERNAL),
            ('Universitas Gadjah Mada', OrganizationType.EDUCATION, 'Higher Education', 'https://ugm.ac.id',
             'Yogyakarta', 'Indonesia', 'Research university', AccessLevel.INTERNAL),

            # NGO/Non-Profit
            ('Transparency International Indonesia', OrganizationType.NGO, 'Anti-Corruption', 'https://ti.or.id',
             'Jakarta', 'Indonesia', 'Anti-corruption organization', AccessLevel.PUBLIC),
            ('Yayasan Lembaga Konsumen Indonesia', OrganizationType.NGO, 'Consumer Protection', 'https://ylki.or.id',
             'Jakarta', 'Indonesia', 'Consumer protection foundation', AccessLevel.PUBLIC),

            # Media
            ('Kompas', OrganizationType.MEDIA, 'Media', 'https://kompas.com',
             'Jakarta', 'Indonesia', 'Major newspaper', AccessLevel.PUBLIC),
            ('Tempo', OrganizationType.MEDIA, 'Media', 'https://tempo.co',
             'Jakarta', 'Indonesia', 'News magazine', AccessLevel.PUBLIC),
            ('CNN Indonesia', OrganizationType.MEDIA, 'Media', 'https://cnnindonesia.com',
             'Jakarta', 'Indonesia', 'News network', AccessLevel.PUBLIC),

            # Donors
            ('World Bank Indonesia', OrganizationType.DONOR, 'International Development', 'https://worldbank.org',
             'Jakarta', 'Indonesia', 'International financial institution', AccessLevel.VVIP),
            ('Asian Development Bank', OrganizationType.DONOR, 'International Development', 'https://adb.org',
             'Manila', 'Philippines', 'Regional development bank', AccessLevel.VVIP),
        ]

        for name, org_type, industry, website, city, country, desc, access in org_data:
            # Generate a simple logo URL using UI Avatars (initials-based)
            initials = ''.join([word[0] for word in name.split()[:2]])
            logo_url = f'https://ui-avatars.com/api/?name={initials}&size=128&background=random&bold=true'

            org, created = Organization.objects.get_or_create(
                name=name,
                defaults={
                    'organization_type': org_type,
                    'industry': industry,
                    'website': website,
                    'email': f'info@{website.split("//")[-1].split("/")[0]}',
                    'phone': f'+62 21 {random.randint(3000000, 9999999)}',
                    'city': city,
                    'country': country,
                    'description': desc,
                    'access_level': access,
                    'logo': logo_url,
                }
            )
            organizations.append(org)  # Append whether created or not

        self.stdout.write(f'  Using {len(organizations)} organizations')
        return organizations

    def create_contacts(self, users, organizations):
        """Create contacts at various organizations."""
        contacts = []

        # Indonesian names
        first_names = [
            'Budi', 'Siti', 'Ahmad', 'Dewi', 'Hendra', 'Maya', 'Rudi', 'Linda',
            'Eko', 'Nur', 'Agus', 'Ratna', 'Bambang', 'Fitri', 'Doni', 'Sri',
            'Tono', 'Rina', 'Joko', 'Ani', 'Amir', 'Sari', 'Wawan', 'Lilis',
            'Iwan', 'Yuni', 'Dedi', 'Tuti', 'Andi', 'Wati'
        ]

        last_names = [
            'Santoso', 'Rahma', 'Yani', 'Lestari', 'Wijaya', 'Kusuma', 'Hartono',
            'Prasetyo', 'Hidayah', 'Salim', 'Dewi', 'Suryadi', 'Handayani',
            'Setiawan', 'Purnomo', 'Susanto', 'Rahayu', 'Wibowo', 'Sari'
        ]

        positions = [
            'Direktur Utama', 'Direktur', 'General Manager', 'Senior Manager',
            'Manager', 'Senior Analyst', 'Analyst', 'Head of Department',
            'Vice President', 'Assistant Vice President', 'Kepala Divisi',
            'Kepala Bagian', 'Staff Ahli', 'Komisaris', 'Sekretaris Jenderal'
        ]

        # Create 50 contacts
        for i in range(50):
            first_name = random.choice(first_names)
            last_name = random.choice(last_names)
            org = random.choice(organizations)

            # Assign access level based on organization's access level
            access_level = org.access_level
            if random.random() > 0.7:  # 30% chance to elevate access
                access_levels = [AccessLevel.INTERNAL, AccessLevel.RESTRICTED, AccessLevel.VIP, AccessLevel.VVIP]
                current_idx = access_levels.index(access_level) if access_level in access_levels else 0
                if current_idx < len(access_levels) - 1:
                    access_level = access_levels[current_idx + 1]

            email = f'{first_name.lower()}.{last_name.lower()}@{org.website.split("//")[-1].split("/")[0]}'

            contact, created = Contact.objects.get_or_create(
                email_primary=email,
                defaults={
                    'first_name': first_name,
                    'last_name': last_name,
                    'phone_primary': f'+62 8{random.randint(10, 99)} {random.randint(1000, 9999)} {random.randint(1000, 9999)}',
                    'phone_mobile': f'+62 8{random.randint(10, 99)} {random.randint(1000, 9999)} {random.randint(1000, 9999)}',
                    'city': org.city,
                    'country': org.country,
                    'access_level': access_level,
                    'contact_type': ContactType.INDIVIDUAL,
                    'assigned_to': random.choice(users),
                    'is_active': True,
                }
            )
            contacts.append(contact)  # Append whether created or not

        self.stdout.write(f'  Using {len(contacts)} contacts')
        return contacts

    def create_job_positions(self, contacts, organizations):
        """Create job positions for contacts."""
        positions = [
            'Direktur Utama', 'Direktur', 'General Manager', 'Senior Manager',
            'Manager', 'Senior Analyst', 'Analyst', 'Head of Department',
            'Vice President', 'Assistant Vice President', 'Kepala Divisi',
            'Kepala Bagian', 'Staff Ahli', 'Komisaris', 'Sekretaris Jenderal'
        ]

        departments = [
            'Corporate Affairs', 'Public Relations', 'Finance', 'Operations',
            'Strategy', 'Human Resources', 'IT', 'Compliance', 'Legal',
            'Research & Development', 'Business Development', 'Marketing'
        ]

        position_count = 0

        # Primary position for each contact
        for contact in contacts:
            org = random.choice(organizations)
            JobPosition.objects.create(
                contact=contact,
                organization=org,
                title=random.choice(positions),
                department=random.choice(departments),
                is_primary=True,
                is_current=True,
                start_date=timezone.now().date() - timedelta(days=random.randint(365, 2000)),
                office_email=contact.email_primary,
                office_phone=contact.phone_primary,
            )
            position_count += 1

        # Some contacts have multiple positions (previous or concurrent)
        for contact in random.sample(contacts, k=min(15, len(contacts))):
            org = random.choice(organizations)
            is_current = random.choice([True, False])
            start = timezone.now().date() - timedelta(days=random.randint(1000, 3000))

            JobPosition.objects.create(
                contact=contact,
                organization=org,
                title=random.choice(positions),
                department=random.choice(departments),
                is_primary=False,
                is_current=is_current,
                start_date=start,
                end_date=None if is_current else start + timedelta(days=random.randint(365, 1500)),
                office_email=f'{contact.first_name.lower()}.{contact.last_name.lower()}@{org.website.split("//")[-1].split("/")[0]}',
            )
            position_count += 1

        self.stdout.write(f'  Created {position_count} job positions')

    def create_contact_notes(self, contacts, users):
        """Create notes for contacts."""
        note_templates = [
            'Bertemu di acara {event}. Membahas potensi kerjasama di bidang {topic}.',
            'Follow up dari pertemuan sebelumnya. Tertarik untuk kolaborasi lebih lanjut.',
            'Kontak sangat responsif dan profesional. Recommended untuk partnership.',
            'Diskusi awal mengenai {topic}. Perlu meeting lanjutan bulan depan.',
            'Referensi dari {referrer}. Background kuat di {expertise}.',
            'Key decision maker untuk {area}. Hubungan baik dengan manajemen.',
            'Menghadiri workshop bersama. Exchange kontak untuk networking.',
            'Potensi untuk joint research di bidang {topic}.',
            'Alumni dari {university}. Network yang luas di industri {industry}.',
            'Scheduled follow-up call untuk diskusi {topic}.',
        ]

        events = ['Forum Ekonomi', 'Konferensi Nasional', 'Seminar', 'Workshop', 'Roundtable Discussion']
        topics = ['digitalisasi', 'sustainability', 'governance', 'innovation', 'policy reform']
        expertise = ['finance', 'technology', 'policy', 'operations', 'strategy']
        universities = ['UI', 'ITB', 'UGM', 'Harvard', 'Oxford']
        industries = ['banking', 'technology', 'energy', 'education', 'government']

        note_count = 0
        for contact in random.sample(contacts, k=min(30, len(contacts))):
            num_notes = random.randint(1, 3)
            for _ in range(num_notes):
                template = random.choice(note_templates)
                note = template.format(
                    event=random.choice(events),
                    topic=random.choice(topics),
                    referrer=random.choice([c.get_full_name() for c in random.sample(contacts, 1)]),
                    expertise=random.choice(expertise),
                    area=random.choice(expertise),
                    university=random.choice(universities),
                    industry=random.choice(industries),
                )

                ContactNote.objects.create(
                    contact=contact,
                    title=f'Note: {random.choice(["Meeting", "Discussion", "Follow-up", "Introduction"])}',
                    content=note,
                    author=random.choice(users),
                    is_private=random.choice([True, False]),
                )
                note_count += 1

        self.stdout.write(f'  Created {note_count} contact notes')

    def create_contact_activities(self, contacts, users):
        """Create activities/interactions with contacts."""
        activity_templates = {
            ActivityType.MEETING: [
                'Courtesy call untuk memperkenalkan organisasi',
                'Diskusi kerjasama strategis',
                'Review project progress',
                'Budget planning discussion',
                'Quarterly business review',
            ],
            ActivityType.CALL: [
                'Follow-up call mengenai proposal',
                'Coordination call untuk upcoming event',
                'Introduction call',
                'Quick sync on urgent matter',
            ],
            ActivityType.EMAIL: [
                'Mengirim proposal kerjasama',
                'Follow-up email pasca meeting',
                'Sharing report dan findings',
                'Invitation untuk event',
            ],
            ActivityType.LUNCH: [
                'Business lunch di {restaurant}',
                'Networking lunch',
                'Informal discussion over lunch',
            ],
            ActivityType.EVENT: [
                'Bertemu di {event_name}',
                'Co-hosting seminar',
                'Panel discussion',
                'Workshop bersama',
            ],
            ActivityType.CONFERENCE: [
                'Presenting di konferensi internasional',
                'Attending summit bersama',
                'Speaking at forum',
            ],
        }

        restaurants = ['Hotel Mulia', 'Grand Hyatt', 'Raffles Jakarta', 'The Plaza']
        events = ['Economic Forum', 'Innovation Summit', 'Policy Conference', 'Tech Expo']

        activity_count = 0
        now = timezone.now()

        for contact in random.sample(contacts, k=min(40, len(contacts))):
            num_activities = random.randint(1, 4)
            for _ in range(num_activities):
                activity_type = random.choice(list(ActivityType.choices))[0]
                template = random.choice(activity_templates.get(activity_type, ['General activity']))

                description = template.format(
                    restaurant=random.choice(restaurants),
                    event_name=random.choice(events),
                )

                # Mix of past and future activities
                days_offset = random.randint(-90, 30)
                activity_date = now + timedelta(days=days_offset)

                # Past activities are completed
                requires_followup = random.choice([True, False]) if days_offset < 0 else random.choice([True, True, False])
                followup_completed = False if days_offset >= 0 else random.choice([True, False])

                ContactActivity.objects.create(
                    contact=contact,
                    activity_type=activity_type,
                    title=f'{activity_type.title()}: {description[:50]}',
                    description=description,
                    activity_date=activity_date,
                    duration_minutes=random.choice([30, 60, 90, 120, 180]),
                    location=random.choice(['Office', 'Virtual', 'Client Office', random.choice(restaurants)]),
                    organized_by=random.choice(users),
                    requires_followup=requires_followup,
                    followup_date=activity_date.date() + timedelta(days=random.randint(7, 30)) if requires_followup else None,
                    followup_completed=followup_completed,
                    outcome='Productive meeting' if days_offset < 0 else '',
                )
                activity_count += 1

        self.stdout.write(f'  Created {activity_count} contact activities')
