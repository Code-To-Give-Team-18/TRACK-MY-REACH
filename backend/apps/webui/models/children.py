from peewee import *
from datetime import datetime
import uuid
from apps.webui.internal.db import DB
from apps.webui.models.regions import Region


class Child(Model):
    id = CharField(max_length=255, unique=True, primary_key=True, default=lambda: str(uuid.uuid4()))
    region = ForeignKeyField(Region, backref='children', on_delete='CASCADE')
    name = CharField(max_length=255)
    age = IntegerField(null=True)
    school = CharField(max_length=255, null=True)
    grade = CharField(max_length=50, null=True)
    description = TextField(null=True)  # New field for child's description
    bio = TextField(null=True)
    video_link = CharField(max_length=500, null=True)
    picture_link = CharField(max_length=500, null=True)
    follower_count = IntegerField(default=0)
    total_received = DecimalField(max_digits=15, decimal_places=2, default=0.00)
    is_active = BooleanField(default=True)
    created_at = DateTimeField(default=datetime.now)
    updated_at = DateTimeField(default=datetime.now)

    class Meta:
        database = DB


class ChildrenTable:
    def __init__(self, db):
        self.db = db
        db.create_tables([Child], safe=True)

    def get_all_children(self) -> list:
        return [
            self._child_to_dict(child)
            for child in Child.select().where(Child.is_active == True)
        ]

    def get_children_by_region(self, region_id: str) -> list:
        return [
            self._child_to_dict(child)
            for child in Child.select().where(
                (Child.region == region_id) & (Child.is_active == True)
            )
        ]

    def get_child_by_id(self, child_id: str) -> dict:
        child = Child.get_or_none(Child.id == child_id)
        return self._child_to_dict(child) if child else None

    def create_child(
        self,
        region_id: str,
        name: str,
        age: int = None,
        school: str = None,
        grade: str = None,
        description: str = None,
        bio: str = None,
        video_link: str = None,
        picture_link: str = None
    ) -> dict:
        child = Child.create(
            region=region_id,
            name=name,
            age=age,
            school=school,
            grade=grade,
            description=description,
            bio=bio,
            video_link=video_link,
            picture_link=picture_link
        )
        return self._child_to_dict(child)

    def update_child(self, child_id: str, **kwargs) -> dict:
        child = Child.get(Child.id == child_id)
        for key, value in kwargs.items():
            if hasattr(child, key):
                setattr(child, key, value)
        child.updated_at = datetime.now()
        child.save()
        return self._child_to_dict(child)

    def increment_follower_count(self, child_id: str) -> dict:
        """Increment follower count - called when a new follower is added"""
        child = Child.get(Child.id == child_id)
        child.follower_count += 1
        child.updated_at = datetime.now()
        child.save()
        return self._child_to_dict(child)
    
    def decrement_follower_count(self, child_id: str) -> dict:
        """Decrement follower count - called when a follower is removed"""
        child = Child.get(Child.id == child_id)
        child.follower_count = max(0, child.follower_count - 1)
        child.updated_at = datetime.now()
        child.save()
        return self._child_to_dict(child)
    
    def sync_follower_count(self, child_id: str) -> dict:
        """Sync follower count with actual followers in Follower table"""
        from apps.webui.models.followers import Follower
        
        child = Child.get(Child.id == child_id)
        actual_count = Follower.select().where(Follower.child == child_id).count()
        child.follower_count = actual_count
        child.updated_at = datetime.now()
        child.save()
        return self._child_to_dict(child)
    
    def sync_all_follower_counts(self):
        """Sync all children's follower counts with Follower table"""
        from apps.webui.models.followers import Follower
        
        # Get all follower counts from Follower table
        follower_counts = (
            Follower.select(
                Follower.child,
                fn.COUNT(Follower.id).alias('count')
            )
            .group_by(Follower.child)
        )
        
        # Update each child's follower count
        for record in follower_counts:
            child = Child.get(Child.id == record.child_id)
            child.follower_count = record.count
            child.updated_at = datetime.now()
            child.save()
        
        # Reset counts for children with no followers
        Child.update(follower_count=0, updated_at=datetime.now()).where(
            Child.id.not_in([r.child_id for r in follower_counts])
        ).execute()

    def update_donation_received(self, child_id: str, amount: float) -> dict:
        child = Child.get(Child.id == child_id)
        child.total_received += amount
        child.updated_at = datetime.now()
        child.save()
        return self._child_to_dict(child)

    def get_popular_children(self, limit: int = 10) -> list:
        """Get most popular children by follower count"""
        return [
            self._child_to_dict(child)
            for child in Child.select()
            .where(Child.is_active == True)
            .order_by(Child.follower_count.desc())
            .limit(limit)
        ]
    
    def get_child_with_followers(self, child_id: str) -> dict:
        """Get child details with actual follower information"""
        from apps.webui.models.followers import Follower
        
        child = Child.get_or_none(Child.id == child_id)
        if not child:
            return None
        
        # Get actual follower count from Follower table
        actual_follower_count = Follower.select().where(Follower.child == child_id).count()
        
        # Get recent followers
        recent_followers = (
            Follower.select()
            .where(Follower.child == child_id)
            .order_by(Follower.followed_at.desc())
            .limit(5)
        )
        
        child_dict = self._child_to_dict(child)
        child_dict['actual_follower_count'] = actual_follower_count
        child_dict['recent_followers'] = [
            {
                'user_id': str(f.user_id),
                'user_name': f.user.name,
                'followed_at': f.followed_at.isoformat()
            }
            for f in recent_followers
        ]
        
        # Sync count if mismatch
        if actual_follower_count != child.follower_count:
            self.sync_follower_count(child_id)
        
        return child_dict

    def delete_child_by_id(self, child_id: str) -> bool:
        """Delete a child by ID"""
        child = Child.get_or_none(Child.id == child_id)
        if not child:
            return False
        child.delete_instance()
        return True

    def seed_default_children(self):
        """Seed default children data for demo purposes"""
        default_children = [
            {
                'id': 'child-001',
                'region_id': 'central',
                'name': 'Shawn Wong',
                'age': 8,
                'school': 'Central Primary School',
                'grade': 'K3',
                'description': 'A bright and cheerful student who loves reading',
                'bio': 'Amy is an enthusiastic K3 student at Central Primary School. Despite facing financial challenges at home, she maintains excellent attendance and shows great interest in learning English. She dreams of becoming a teacher one day to help other children learn.',
                'video_link': 'https://example.com/videos/amy-story.mp4',
                'picture_link': 'https://scontent.fsin15-2.fna.fbcdn.net/v/t15.5256-10/518201805_638651551884759_2662462096286396927_n.jpg?_nc_cat=107&ccb=1-7&_nc_sid=282d23&_nc_ohc=fsvZkUhQLeQQ7kNvwHopkQ1&_nc_oc=AdnfCBZzG_sUr09Rakg9jJNlPtiWwS1KQSnM2mnJuWbtpHcUQ0YveeKFLjP09nnkNT8&_nc_zt=23&_nc_ht=scontent.fsin15-2.fna&_nc_gid=wBWeeINtuE3rBxXLSg3Mkg&oh=00_AfX5Lkt243qEQedS3NLfoMyLcPDOQgm3hAxDyXsEfnlKrg&oe=68B0FD26',
                'follower_count': 45,
                'total_received': 3500.00
            },
            {
                'id': 'child-002',
                'region_id': 'sham-shui-po',
                'name': 'Kevin Chan',
                'age': 7,
                'school': 'Sham Shui Po District School',
                'grade': 'K2',
                'description': 'Passionate about art and creativity',
                'bio': 'Kevin is a creative K2 student who loves drawing and painting. Coming from a single-parent household, he finds joy in art classes provided by Project REACH. His artwork has been featured in school exhibitions, bringing pride to his mother.',
                'video_link': 'https://example.com/videos/kevin-art.mp4',
                'picture_link': 'https://c8.alamy.com/comp/C5D8N4/hong-kong-primary-school-in-kowloon-photo-by-sean-sprague-C5D8N4.jpg',
                'follower_count': 32,
                'total_received': 2800.00
            },
            {
                'id': 'child-003',
                'region_id': 'kwun-tong',
                'name': 'Sophie Lee',
                'age': 9,
                'school': 'Kwun Tong Community School',
                'grade': 'K3',
                'description': 'Excels in mathematics and problem-solving',
                'bio': 'Sophie is a determined K3 student with exceptional mathematical abilities. Living in a subdivided flat with her grandparents, she participates in after-school tutoring through Project REACH. Her recent achievement in a district math competition has inspired her peers.',
                'video_link': 'https://example.com/videos/sophie-math.mp4',
                'picture_link': 'https://scontent.fsin15-1.fna.fbcdn.net/v/t39.30808-6/480333871_1021012063394467_5951696681728135802_n.jpg?stp=dst-jpg_p960x960_tt6&_nc_cat=101&ccb=1-7&_nc_sid=127cfc&_nc_ohc=OsAs_PAvHHcQ7kNvwFGr5R5&_nc_oc=AdlnLSzrFXAb3roj9tgIeOrRm3wd4CnVzo8hPQ_YmL06gh_DosIGXuTAEbwBJaAZ70o&_nc_zt=23&_nc_ht=scontent.fsin15-1.fna&_nc_gid=B9_s00eK1AYoJ2wZLK-6iw&oh=00_AfWvvuJiXr0bobv0dQBU5iZq_5r7Sfays2DrFXyO_du5uA&oe=68B105E9',
                'follower_count': 58,
                'total_received': 4200.00
            },
            {
                'id': 'child-004',
                'region_id': 'yau-tsim-mong',
                'name': 'Tommy Liu',
                'age': 6,
                'school': 'Yau Ma Tei Primary School',
                'grade': 'K1',
                'description': 'Active student who enjoys sports and teamwork',
                'bio': 'Tommy is an energetic K1 student who loves sports, especially football. His family recently immigrated to Hong Kong, and Project REACH has helped him integrate into school life. He shows great team spirit and leadership potential despite his young age.',
                'video_link': 'https://example.com/videos/tommy-sports.mp4',
                'picture_link': 'https://tyr-jour.hkbu.edu.hk/wp-content/uploads/2023/10/50AC454F-2107-48BF-BAE7-75ED22EF9C88-scaled.jpeg',
                'follower_count': 28,
                'total_received': 2100.00
            },
            {
                'id': 'child-005',
                'region_id': 'eastern',
                'name': 'Emily Tam',
                'age': 8,
                'school': 'Eastern District Primary School',
                'grade': 'K3',
                'description': 'Musical talent with a love for singing',
                'bio': 'Emily discovered her passion for music through Project REACH\'s music program. Living with her elderly grandmother, she practices singing daily and has performed at several school events. Her cheerful personality and beautiful voice bring joy to everyone around her.',
                'video_link': 'https://example.com/videos/emily-singing.mp4',
                'picture_link': 'https://hongkongtesol.com/sites/default/files/styles/mobile_header_800x600/public/2022-10/Primary-school-courses-summary-800x600.jpg?h=827069f2&itok=o2e4zmGn',
                'follower_count': 72,
                'total_received': 5600.00
            },
            {
                'id': 'child-006',
                'region_id': 'wong-tai-sin',
                'name': 'Michael Cheung',
                'age': 7,
                'school': 'Wong Tai Sin District School',
                'grade': 'K2',
                'description': 'Curious learner with interest in science',
                'bio': 'Michael is a curious K2 student who loves asking "why" about everything. His family struggles financially, but Project REACH\'s science enrichment program has nurtured his natural curiosity. He recently won a prize for his simple science project about plants.',
                'video_link': 'https://example.com/videos/michael-science.mp4',
                'picture_link': 'https://www.oxbridgeschool.hk/images/page/futureevents--600px.jpg',
                'follower_count': 41,
                'total_received': 3300.00
            },
            {
                'id': 'child-007',
                'region_id': 'sha-tin',
                'name': 'Lily Chen',
                'age': 9,
                'school': 'Sha Tin Primary School',
                'grade': 'K3',
                'description': 'Dedicated student with strong language skills',
                'bio': 'Lily is a hardworking K3 student who excels in both Chinese and English. Coming from a non-Cantonese speaking family, Project REACH\'s language support has been crucial for her academic success. She helps translate for new students and shows remarkable empathy.',
                'video_link': 'https://example.com/videos/lily-language.mp4',
                'picture_link': 'https://image.hkstandard.com.hk/f/1024p0/0x0/100/none/e929286413f2ff2c6b5325e71a928ff5/images/2022-01/20220111131245185738indexPhoto.jpg',
                'follower_count': 53,
                'total_received': 4100.00
            },
            {
                'id': 'child-008',
                'region_id': 'tsuen-wan',
                'name': 'Ryan Ho',
                'age': 6,
                'school': 'Tsuen Wan Community School',
                'grade': 'K1',
                'description': 'Enthusiastic about technology and computers',
                'bio': 'Ryan is the youngest tech enthusiast in his K1 class. Despite limited resources at home, he shows incredible aptitude for technology through Project REACH\'s digital literacy program. His ability to help classmates with tablets has earned him the nickname "Little IT Helper."',
                'video_link': 'https://example.com/videos/ryan-tech.mp4',
                'picture_link': 'https://yca.edu.hk/wp-content/uploads/2023/05/home-about-image-pc.jpg',
                'follower_count': 38,
                'total_received': 2900.00
            },
            {
                'id': 'child-009',
                'region_id': 'tuen-mun',
                'name': 'Jessica Ng',
                'age': 8,
                'school': 'Tuen Mun District Primary',
                'grade': 'K3',
                'description': 'Aspiring writer with vivid imagination',
                'bio': 'Jessica loves storytelling and creative writing. Living in temporary housing with her family, she finds escape through books provided by Project REACH. Her short stories about friendship and kindness have been compiled into a small book for the school library.',
                'video_link': 'https://example.com/videos/jessica-writing.mp4',
                'picture_link': 'https://c8.alamy.com/comp/ABWCH5/school-children-age-7-and-8-in-uniform-smiling-in-hong-kong-island-ABWCH5.jpg',
                'follower_count': 47,
                'total_received': 3700.00
            },
            {
                'id': 'child-010',
                'region_id': 'yuen-long',
                'name': 'Daniel Lam',
                'age': 7,
                'school': 'Yuen Long Primary School',
                'grade': 'K2',
                'description': 'Nature lover with interest in environmental science',
                'bio': 'Daniel is passionate about nature and the environment. Growing up near rural areas of Yuen Long, he participates in Project REACH\'s environmental education program. He has started a small recycling initiative at school and inspired his classmates to care for nature.',
                'video_link': 'https://example.com/videos/daniel-nature.mp4',
                'picture_link': 'https://c8.alamy.com/comp/A717X6/china-hong-kong-line-of-school-children-in-central-district-A717X6.jpg',
                'follower_count': 35,
                'total_received': 2600.00
            },
            {
                'id': 'child-011',
                'region_id': 'kwai-tsing',
                'name': 'Grace Wong',
                'age': 9,
                'school': 'Kwai Tsing District School',
                'grade': 'K3',
                'description': 'Social butterfly who brings communities together',
                'bio': 'Grace is known for her ability to make friends and bring people together. Despite language barriers at home, she excels in communication through Project REACH\'s social skills program. She organizes small study groups and helps shy classmates feel included.',
                'video_link': 'https://example.com/videos/grace-social.mp4',
                'picture_link': 'https://www.cnbayarea.org.cn/img/0/89/89509/322968.jpg',
                'follower_count': 64,
                'total_received': 4900.00
            },
            {
                'id': 'child-012',
                'region_id': 'north',
                'name': 'Peter Yip',
                'age': 6,
                'school': 'North District Primary School',
                'grade': 'K1',
                'description': 'Young athlete showing promise in swimming',
                'bio': 'Peter discovered his love for swimming through Project REACH\'s sports program. Living near the border area, his family faces long commutes, but his dedication to training is unwavering. He recently earned his first swimming certificate, a proud moment for his family.',
                'video_link': 'https://example.com/videos/peter-swimming.mp4',
                'picture_link': 'https://media.istockphoto.com/id/177509883/photo/portait-of-students-in-chinese-school-classroom.jpg?s=612x612&w=0&k=20&c=aTbkfg_wSYim5BmvfS4-gYszCVTbncQL62jXOqyOC3M=',
                'follower_count': 30,
                'total_received': 2400.00
            },
            {
                'id': 'child-013',
                'region_id': 'sai-kung',
                'name': 'Sarah Ma',
                'age': 8,
                'school': 'Sai Kung Central Primary',
                'grade': 'K3',
                'description': 'Budding marine biologist fascinated by ocean life',
                'bio': 'Sarah lives near the coast and dreams of protecting marine life. Through Project REACH\'s environmental program, she has learned about ocean conservation. She leads beach cleanup activities with her classmates and has created an awareness campaign about plastic pollution.',
                'video_link': 'https://example.com/videos/sarah-ocean.mp4',
                'picture_link': 'https://c8.alamy.com/comp/A719GD/china-hong-kong-school-children-on-field-trip-into-central-city-A719GD.jpg',
                'follower_count': 56,
                'total_received': 4300.00
            },
            {
                'id': 'child-014',
                'region_id': 'tai-po',
                'name': 'Alex Fung',
                'age': 7,
                'school': 'Tai Po Government Primary',
                'grade': 'K2',
                'description': 'Young chef with culinary dreams',
                'bio': 'Alex helps his grandmother at her small food stall after school. Project REACH\'s nutrition program has taught him about healthy cooking. He dreams of becoming a chef and has started a recipe book with simple, healthy meals that his classmates can make at home.',
                'video_link': 'https://example.com/videos/alex-cooking.mp4',
                'picture_link': 'https://media.gettyimages.com/id/51345722/photo/schoolchildren-leave-class-for-their-lunch-break-07-may-1999-in-hong-kong-hong-kongs-government.jpg?s=612x612&w=gi&k=20&c=hPfu0AutXqoUjq1Dw9Ix9KIJnRaL65W_0ScfCc_CcXg=',
                'follower_count': 43,
                'total_received': 3400.00
            },
            {
                'id': 'child-015',
                'region_id': 'islands',
                'name': 'Maya Wong',
                'age': 9,
                'school': 'Lantau Island Primary School',
                'grade': 'K3',
                'description': 'Cultural ambassador bridging communities',
                'bio': 'Maya lives on Lantau Island and faces long commutes to school. She speaks three languages and helps new immigrant families in her community. Through Project REACH, she has organized cultural exchange events that celebrate diversity and bring island communities together.',
                'video_link': 'https://example.com/videos/maya-culture.mp4',
                'picture_link': 'https://www.shutterstock.com/image-photo/fortresshillhongkong21oct2021in-lunch-hour-timestudents-mask-260nw-2127665138.jpg',
                'follower_count': 68,
                'total_received': 5200.00
            },
            {
                'id': 'child-016',
                'region_id': 'wan-chai',
                'name': 'Oliver Tse',
                'age': 6,
                'school': 'Wan Chai District School',
                'grade': 'K1',
                'description': 'Young inventor with creative solutions',
                'bio': 'Oliver loves building things from recycled materials. Living in a small apartment, he creates innovative storage solutions and toys. Project REACH\'s STEM program has nurtured his creativity, and his recent invention of a foldable study desk won praise from teachers.',
                'video_link': 'https://example.com/videos/oliver-invention.mp4',
                'picture_link': 'https://www.shutterstock.com/image-photo/fortresshillhongkong21oct2021in-lunch-hour-timestudents-mask-260nw-2127664019.jpg',
                'follower_count': 37,
                'total_received': 2800.00
            },
            {
                'id': 'child-017',
                'region_id': 'southern',
                'name': 'Chloe Yeung',
                'age': 8,
                'school': 'Aberdeen Primary School',
                'grade': 'K3',
                'description': 'Dancing through challenges with grace',
                'bio': 'Chloe discovered her passion for dance through Project REACH\'s arts program. Despite her family\'s financial struggles, she practices daily in their small living room. Her performances at school events have inspired other students to pursue their artistic dreams.',
                'video_link': 'https://example.com/videos/chloe-dance.mp4',
                'picture_link': 'https://c8.alamy.com/comp/A7XN6N/asia-china-hong-kong-school-children-A7XN6N.jpg',
                'follower_count': 61,
                'total_received': 4700.00
            },
            {
                'id': 'child-018',
                'region_id': 'kowloon-city',
                'name': 'Nathan Kwok',
                'age': 7,
                'school': 'Kowloon City Primary',
                'grade': 'K2',
                'description': 'History enthusiast preserving local heritage',
                'bio': 'Nathan loves learning about Hong Kong\'s history. Living near the old Kowloon Walled City site, he has become a young historian through Project REACH\'s cultural program. He gives tours to visitors and has created a digital archive of neighborhood stories from elderly residents.',
                'video_link': 'https://example.com/videos/nathan-history.mp4',
                'picture_link': 'http://www.internationalschoolsearch.com/images/uploads/bf174bd9423ae5423a55f5fa348434ec.jpg',
                'follower_count': 49,
                'total_received': 3800.00
            },
            {
                'id': 'child-019',
                'region_id': 'central',
                'name': 'Isabella Chu',
                'age': 9,
                'school': 'Central District Primary',
                'grade': 'K3',
                'description': 'Young entrepreneur with big dreams',
                'bio': 'Isabella started a small recycling business at school to help her family. Project REACH\'s entrepreneurship program has taught her basic business skills. She now manages a team of classmates who collect and sort recyclables, with proceeds going to school supplies for needy students.',
                'video_link': 'https://example.com/videos/isabella-business.mp4',
                'picture_link': 'https://chatteris.org.hk/wp-content/uploads/2021/02/CASWCMC-9-10-1024x768.jpg',
                'follower_count': 74,
                'total_received': 5800.00
            },
            {
                'id': 'child-020',
                'region_id': 'sham-shui-po',
                'name': 'Jason Leung',
                'age': 6,
                'school': 'Sham Shui Po Primary',
                'grade': 'K1',
                'description': 'Robotics enthusiast building the future',
                'bio': 'Jason is fascinated by robots and automation. Living in one of Hong Kong\'s poorest districts, he uses cardboard and simple materials to create robot models. Project REACH\'s robotics club has given him access to real programming tools, igniting his passion for technology.',
                'video_link': 'https://example.com/videos/jason-robots.mp4',
                'picture_link': 'http://www.cityu.edu.hk/class/media_events/news/photos/20190923_admission%20talk.jpg',
                'follower_count': 40,
                'total_received': 3100.00
            },
            {
                'id': 'child-021',
                'region_id': 'kwun-tong',
                'name': 'Zoe Pang',
                'age': 8,
                'school': 'Kwun Tong East Primary',
                'grade': 'K3',
                'description': 'Community gardener growing hope',
                'bio': 'Zoe transformed a vacant lot near her housing estate into a community garden. Through Project REACH\'s urban farming program, she teaches neighbors how to grow vegetables. Her garden now feeds several families and has become a gathering place for the community.',
                'video_link': 'https://example.com/videos/zoe-garden.mp4',
                'picture_link': 'https://msftstories.thesourcemediaassets.com/sites/427/2020/02/Photo-1.jpg',
                'follower_count': 52,
                'total_received': 4000.00
            },
            {
                'id': 'child-022',
                'region_id': 'yau-tsim-mong',
                'name': 'Ethan Siu',
                'age': 7,
                'school': 'Mong Kok Primary School',
                'grade': 'K2',
                'description': 'Street artist beautifying neighborhoods',
                'bio': 'Ethan channels his energy into street art and murals. Growing up in busy Mong Kok, he uses art to brighten his community. Project REACH\'s art program has provided him with proper materials and mentorship, leading to commissioned murals at local businesses.',
                'video_link': 'https://example.com/videos/ethan-art.mp4',
                'picture_link': 'https://f.hubspotusercontent10.net/hub/67369/hubfs/2021%20Compressed%20Images/Hong%20Kong%20Compressed/Andrea-Vandermeer-Hong-Kong-4.jpg?width=730',
                'follower_count': 46,
                'total_received': 3600.00
            },
            {
                'id': 'child-023',
                'region_id': 'eastern',
                'name': 'Luna Hui',
                'age': 9,
                'school': 'Chai Wan Primary School',
                'grade': 'K3',
                'description': 'Coding prodigy creating educational apps',
                'bio': 'Luna taught herself basic coding using library computers. Through Project REACH\'s digital literacy program, she has developed simple educational games for younger students. Her math learning app is now used by several K1 classes in her school.',
                'video_link': 'https://example.com/videos/luna-coding.mp4',
                'picture_link': 'https://www.gov.hk/en/nonresidents/images/deco58_students.jpg',
                'follower_count': 67,
                'total_received': 5100.00
            },
            {
                'id': 'child-024',
                'region_id': 'wong-tai-sin',
                'name': 'Marcus Lo',
                'age': 6,
                'school': 'Wong Tai Sin Catholic Primary',
                'grade': 'K1',
                'description': 'Young photographer capturing life stories',
                'bio': 'Marcus documents his community through photography using an old phone. Project REACH\'s media program has taught him composition and storytelling. His photo essay about elderly residents in his estate won a district competition and raised awareness about senior isolation.',
                'video_link': 'https://example.com/videos/marcus-photos.mp4',
                'picture_link': 'https://media.istockphoto.com/id/492197413/photo/chinese-students-and-teacher-working-together-hong-kong-asia.jpg?s=612x612&w=0&k=20&c=OdLEGPm91_ts79GtU15bh5nSqzOSOcnmK_bHoNZL2N4=',
                'follower_count': 44,
                'total_received': 3500.00
            }
        ]
        
        for child_data in default_children:
            existing = Child.get_or_none(Child.id == child_data['id'])
            if not existing:
                # Extract region_id separately as it's a foreign key
                region_id = child_data.pop('region_id')
                Child.create(region=region_id, **child_data)

    def _child_to_dict(self, child) -> dict:
        if not child:
            return None
        return {
            'id': child.id,
            'region_id': child.region_id,
            'region_name': child.region.name if child.region else None,
            'name': child.name,
            'age': child.age,
            'school': child.school,
            'grade': child.grade,
            'description': child.description,
            'bio': child.bio,
            'video_link': child.video_link,
            'picture_link': child.picture_link,
            'follower_count': child.follower_count,
            'total_received': float(child.total_received),
            'is_active': child.is_active,
            'created_at': child.created_at.isoformat() if child.created_at else None,
            'updated_at': child.updated_at.isoformat() if child.updated_at else None
        }


Children = ChildrenTable(DB)
Children.seed_default_children()